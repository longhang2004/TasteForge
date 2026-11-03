"""Build local review artifacts from a clean, validated candidate. Never publish."""

from pathlib import Path
import datetime
import hashlib
import json
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def command(*args):
    return subprocess.check_output(args, cwd=ROOT, text=True, stderr=subprocess.STDOUT)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_skill_archive(path, skill_root, license_path):
    files = [source for source in skill_root.rglob("*") if source.is_file()]
    expected = {"tasteforge/" + source.relative_to(skill_root).as_posix() for source in files} | {"tasteforge/LICENSE"}
    with zipfile.ZipFile(path) as archive:
        assert set(archive.namelist()) == expected and len(archive.namelist()) == len(expected), "Unexpected or duplicate skill archive members"
        for source in files:
            assert archive.read("tasteforge/" + source.relative_to(skill_root).as_posix()) == source.read_bytes(), f"Skill archive differs: {source.relative_to(skill_root)}"
        assert archive.read("tasteforge/LICENSE") == license_path.read_bytes()


def main():
    version = json.loads((ROOT / "package.json").read_text())["version"]
    assert re.fullmatch(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?", version)
    packages = [("tasteforge", "cli", "tasteforge"), ("@tasteforge/core", "core", "tasteforge-core"), ("@tasteforge/knowledge", "knowledge", "tasteforge-knowledge")]
    for name, folder, _ in packages:
        manifest = json.loads((ROOT / f"packages/{folder}/package.json").read_text())
        assert manifest["name"] == name and manifest["version"] == version
    assert not command("git", "status", "--porcelain"), "Commit/review the candidate first; working tree must be clean"
    revision = command("git", "rev-parse", "HEAD").strip()
    preparation = ROOT / f".tmp/release-v{version}"
    summary = json.loads((preparation / "validation/summary.json").read_text())
    assert summary["status"] == "passed" and summary["sourceCommit"] == revision, "Validation must name this exact commit"
    out = preparation / "artifacts"
    assert not out.exists() or not any(out.iterdir()), "Artifact directory is nonempty; do not overwrite a prepared version"
    out.mkdir(parents=True, exist_ok=True)
    logdir = preparation / "validation"
    artifacts = []
    for name, folder, stem in packages:
        target = out / f"{stem}-{version}.tgz"
        log = command("pnpm", "--filter", name, "pack", "--out", str(target))
        (logdir / f"pack-{folder}.log").write_text(log)
        manifest = json.loads(command("tar", "-xOf", str(target), "package/package.json"))
        assert manifest["version"] == version and manifest["name"] == name
        assert all(not spec.startswith("workspace:") for spec in manifest.get("dependencies", {}).values())
        members = command("tar", "-tzf", str(target)).splitlines()
        assert "package/LICENSE" in members and "package/dist/index.js" in members
        if folder == "knowledge":
            assert "package/dist/data/references.json" in members and "package/reference-lock.json" in members
            assert any(path.startswith("package/third-party/") for path in members)
        if folder == "cli":
            for source in (ROOT / "skills/tasteforge").rglob("*"):
                if source.is_file():
                    member = "package/skills/tasteforge/" + source.relative_to(ROOT / "skills/tasteforge").as_posix()
                    packed = subprocess.check_output(["tar", "-xOf", str(target), member], cwd=ROOT)
                    assert packed == source.read_bytes(), f"Packaged skill differs: {member}"
        artifacts.append(target)
    skill_zip = out / f"tasteforge-skill-v{version}.zip"
    tested_skill = summary.get("standaloneSkillArchive")
    if tested_skill:
        relative = Path(tested_skill["path"])
        assert not relative.is_absolute() and ".." not in relative.parts
        tested_archive = (preparation / relative).resolve()
        assert tested_archive.is_relative_to(preparation.resolve()) and tested_archive.is_file()
        assert digest(tested_archive) == tested_skill["sha256"], "Tested skill archive changed"
        shutil.copyfile(tested_archive, skill_zip)
        assert digest(skill_zip) == tested_skill["sha256"], "Copied skill archive differs from tested bytes"
    else:
        with zipfile.ZipFile(skill_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for source in sorted((ROOT / "skills/tasteforge").rglob("*")):
                if source.is_file():
                    archive.write(source, "tasteforge/" + source.relative_to(ROOT / "skills/tasteforge").as_posix())
            archive.write(ROOT / "LICENSE", "tasteforge/LICENSE")
    verify_skill_archive(skill_zip, ROOT / "skills/tasteforge", ROOT / "LICENSE")
    artifacts.append(skill_zip)
    source_zip = out / f"TasteForge-v{version}-source.zip"
    command("git", "archive", "--format=zip", f"--prefix=TasteForge-v{version}/", f"--output={source_zip}", revision)
    artifacts.append(source_zip)
    notes = out / "RELEASE_NOTES.md"
    notes.write_bytes((ROOT / f"docs/releases/v{version}.md").read_bytes())
    artifacts.append(notes)
    validation = out / "VALIDATION.json"
    validation.write_text(json.dumps(summary, indent=2) + "\n")
    artifacts.append(validation)
    manifest = out / "release-manifest.json"
    manifest.write_text(json.dumps({
        "version": version, "targetTag": "v" + version, "sourceCommit": revision,
        "createdAtUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "artifactStatus": "validated-local-candidate", "networkPublicationPerformed": False,
        "files": [{"name": file.name, "bytes": file.stat().st_size, "sha256": digest(file)} for file in artifacts],
    }, indent=2) + "\n")
    artifacts.append(manifest)
    (out / "SHA256SUMS").write_text("".join(f"{digest(file)}  {file.name}\n" for file in artifacts))
    print(f"Prepared {version} at {revision}: {len(artifacts) + 1} files in {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

from pathlib import Path
import runpy
import tempfile
import warnings
import zipfile
verify = runpy.run_path("scripts/prepare-release.py")["verify_skill_archive"]
with tempfile.TemporaryDirectory(prefix="tasteforge-release-review-") as directory:
    root = Path(directory)
    skill = root / "skill"
    skill.mkdir()
    (skill / "SKILL.md").write_bytes(b"skill")
    license = root / "LICENSE"
    license.write_bytes(b"license")
    expected = [("tasteforge/SKILL.md", b"skill"), ("tasteforge/LICENSE", b"license")]
    cases = {
        "valid": (expected, True),
        "duplicate": (expected + [expected[0]], False),
        "traversal": (expected + [("../outside", b"payload")], False),
        "unexpected": (expected + [("tasteforge/extra", b"payload")], False),
        "missing-license": ([expected[0]], False),
        "different-source": ([("tasteforge/SKILL.md", b"changed"), expected[1]], False),
    }
    for name, (members, allowed) in cases.items():
        archive = root / (name + ".zip")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(archive, "w") as output:
                for member, data in members:
                    output.writestr(member, data)
        try:
            verify(archive, skill, license)
            result = True
        except AssertionError:
            result = False
        assert result == allowed, name
        print(name + ": passed")
print("Isolated ZIP verifier checks: 6 passed; no repository files changed")

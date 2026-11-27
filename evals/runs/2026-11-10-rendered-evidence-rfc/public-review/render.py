"""Render a bounded, offline annotation example; no public CLI integration."""
import argparse
import base64
import hashlib
import html
import json
from pathlib import Path
import re
import stat
import struct
import sys


FORMAT = "tasteforge.rendered-evidence.prototype.v1"
MANIFEST_LIMIT = 256 * 1024
ASSET_LIMIT = 2 * 1024 * 1024
KINDS = {"source-fact", "rendered-observation", "historical-runtime",
         "contextual-judgment", "unassessed"}
DECISIONS = {"keep", "adapt", "remove", "unassessed"}
PROSE = ("title", "observation", "consequence", "applicability", "recheck", "limits")


def _keys(value, expected, label):
    if not isinstance(value, dict):
        raise ValueError(f"{label}: expected an object")
    missing, extra = set(expected) - value.keys(), value.keys() - set(expected)
    if missing or extra:
        raise ValueError(f"{label}: missing {sorted(missing)}, extra {sorted(extra)}")


def _text(value, label):
    if not isinstance(value, str) or not value.strip() or len(value) > 4096:
        raise ValueError(f"{label}: expected nonempty text up to 4096 characters")
    return value


def _id(value, label):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", _text(value, label)):
        raise ValueError(f"{label}: invalid lowercase identifier")
    return value


def _read(root, relative, limit=ASSET_LIMIT):
    if not isinstance(relative, str) or "\\" in relative or ":" in relative:
        raise ValueError(f"Invalid path: {relative!r}")
    parts = relative.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ValueError(f"Invalid path components: {relative!r}")
    path = root
    for part in parts:
        path = path / part
        if path.is_symlink():
            raise ValueError(f"Input path has a symbolic link: {relative}")
    info = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
        raise ValueError(f"Input is nonregular or multiply linked: {relative}")
    if info.st_size > limit:
        raise ValueError(f"Input exceeds byte limit: {relative}")
    with path.open("rb") as stream:
        data = stream.read(limit + 1)
    if len(data) > limit:
        raise ValueError(f"Input exceeds byte limit: {relative}")
    return data


def _asset(root, record, label):
    _keys(record, {"path", "sha256"}, label)
    digest = _text(record["sha256"], label + ".sha256")
    if not re.fullmatch(r"[a-f0-9]{64}", digest):
        raise ValueError(f"{label}: invalid SHA-256")
    data = _read(root, record["path"])
    if hashlib.sha256(data).hexdigest() != digest:
        raise ValueError(f"Hash mismatch: {record['path']}")
    return data


def _capture(root, capture):
    _keys(capture, {"id", "state", "viewportWidth", "image", "source", "report"}, "capture")
    cid = _id(capture["id"], "capture.id")
    _text(capture["state"], cid + ".state")
    width = capture["viewportWidth"]
    if type(width) is not int or width <= 0:
        raise ValueError(f"{cid}: viewportWidth must be a positive integer")
    image = _asset(root, capture["image"], cid + ".image")
    _asset(root, capture["source"], cid + ".source")
    raw_report = _asset(root, capture["report"], cid + ".report")
    if len(image) < 24 or image[:8] != b"\x89PNG\r\n\x1a\n" or image[12:16] != b"IHDR":
        raise ValueError(f"{cid}: unsupported PNG header")
    pixels = struct.unpack(">II", image[16:24])
    if min(pixels) <= 0 or pixels[0] * pixels[1] > 16_000_000:
        raise ValueError(f"{cid}: invalid PNG dimensions")
    report = json.loads(raw_report)
    if not isinstance(report, dict) or report.get("sourceSha256") != capture["source"]["sha256"]:
        raise ValueError(f"{cid}: report/source binding mismatch")
    image_path, report_path = Path(capture["image"]["path"]), Path(capture["report"]["path"])
    if image_path.parent != report_path.parent:
        raise ValueError(f"{cid}: image/report directory binding mismatch")
    entries = report.get("captures")
    if not isinstance(entries, list):
        raise ValueError(f"{cid}: report captures are missing")
    matches = [entry for entry in entries if isinstance(entry, dict)
               and entry.get("file") == image_path.name and entry.get("state") == capture["state"]
               and type(entry.get("width")) is int and entry["width"] == width]
    if (len(matches) != 1 or type(matches[0].get("viewport")) is not int
            or matches[0]["viewport"] != width):
        raise ValueError(f"{cid}: capture/report entry is missing, ambiguous or has inconsistent viewport")
    return {"record": capture, "image": image, "pixels": pixels,
            "entry": matches[0], "browser": report.get("browser")}


def _findings(values, captures):
    if not isinstance(values, list) or len(values) > 8:
        raise ValueError("findings: expected at most eight records")
    seen = set()
    fields = {"id", "captureId", "kind", "decision", "sourceHint", "rect", *PROSE}
    for finding in values:
        _keys(finding, fields, "finding")
        fid = _id(finding["id"], "finding.id")
        if fid in seen:
            raise ValueError(f"Duplicate finding id: {fid}")
        seen.add(fid)
        capture_id = _id(finding["captureId"], fid + ".captureId")
        if capture_id not in captures:
            raise ValueError(f"{fid}: unresolved captureId {capture_id!r}")
        if _text(finding["kind"], fid + ".kind") not in KINDS:
            raise ValueError(f"{fid}: invalid evidence kind")
        if _text(finding["decision"], fid + ".decision") not in DECISIONS:
            raise ValueError(f"{fid}: invalid decision")
        for field in PROSE:
            _text(finding[field], fid + "." + field)
        if finding["sourceHint"] is not None:
            _text(finding["sourceHint"], fid + ".sourceHint")
        rect = finding["rect"]
        if rect is not None:
            if not isinstance(rect, list) or len(rect) != 4 or any(type(n) is not int for n in rect):
                raise ValueError(f"{fid}: rect must contain four integer capture pixels")
            x, y, w, h = rect
            pw, ph = captures[finding["captureId"]]["pixels"]
            if min(x, y) < 0 or min(w, h) <= 0 or x + w > pw or y + h > ph:
                raise ValueError(f"{fid}: rect is outside the capture")
    return values


def _esc(value):
    return html.escape(str(value), quote=True)


def _sheet(data, findings):
    record, entry = data["record"], data["entry"]
    cid, (pw, ph) = record["id"], data["pixels"]
    selected = [f for f in findings if f["captureId"] == cid]
    regions, notes = [], []
    for finding in selected:
        fid, rect = finding["id"], finding["rect"]
        if rect is not None:
            x, y, w, h = rect
            regions.append(f'<rect data-finding="{fid}" x="{x}" y="{y}" width="{w}" height="{h}"/>')
            regions.append(f'<text x="{x + 4}" y="{y + 16}">{fid}</text>')
        location = "Authored region: " + fid if rect else "No region asserted; text evidence only."
        body = "".join(f'<p><strong>{field.capitalize()}:</strong> {_esc(finding[field])}</p>'
                       for field in PROSE if field != "title")
        hint = "" if finding["sourceHint"] is None else f'<p>Source hint: <code>{_esc(finding["sourceHint"])}</code></p>'
        notes.append(f'<article class="finding" id="note-{fid}"><h3>{_esc(finding["title"])}</h3>'
                     f'<p class="meta">{_esc(finding["kind"])} · Decision: {_esc(finding["decision"])}</p>'
                     f'<p class="meta">{_esc(location)}</p>{body}{hint}</article>')
    trace = {
        "Image pixels": [pw, ph], "Recorded CSS viewport width": entry["viewport"],
        "Per-capture CSS viewport height": "unrecorded", "Scroll X": "unrecorded",
        "Scroll Y": entry.get("scrollY"), "Image-time DPR": "unrecorded",
        "Browser": data["browser"], "Framing": entry.get("framing"),
        "Active element": entry.get("active"),
    }
    trace = {key: ("unrecorded" if value is None else value) for key, value in trace.items()}
    bindings = {key: record[key] for key in ("image", "source", "report")}
    metadata = _esc(json.dumps({"trace": trace, "bindings": bindings}, ensure_ascii=False, indent=2))
    encoded = base64.b64encode(data["image"]).decode("ascii")
    image_url = "data:image/png;base64," + encoded
    caption = f'{cid}; state {record["state"]}; retained image {pw} × {ph} pixels'
    return f'''<section class="sheet" id="capture-{cid}">
<h2>{_esc(cid)} / {_esc(record["state"])}</h2>
<p class="meta">Recorded scroll Y: {_esc(trace["Scroll Y"])}. Image-time DPR: unrecorded.</p>
<div class="sheet-grid"><figure>
<div class="capture-stage" style="width:{record["viewportWidth"]}px;max-width:100%">
<img src="{image_url}" width="{pw}" height="{ph}" alt="{_esc(caption)}; static UI evidence">
<svg class="overlay" viewBox="0 0 {pw} {ph}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">{"".join(regions)}</svg>
</div><figcaption>{_esc(caption)}. Screenshot controls are static evidence.</figcaption>
</figure><div>{"".join(notes) or "<p>No authored observations; no UX assessment implied.</p>"}
<details><summary>File bindings and recorded trace</summary><pre>{metadata}</pre></details>
</div></div></section>'''


def render(document: dict, root: Path) -> str:
    """Verify exact local inputs, then return escaped, deterministic static HTML."""
    root = Path(root).resolve(strict=True)
    _keys(document, {"format", "sourceRevision", "captures", "findings"}, "manifest")
    if document["format"] != FORMAT:
        raise ValueError("Unsupported format")
    revision = document["sourceRevision"]
    if not isinstance(revision, str) or not re.fullmatch(r"[a-f0-9]{40}", revision):
        raise ValueError("Invalid sourceRevision provenance label")
    records = document["captures"]
    if not isinstance(records, list) or not 1 <= len(records) <= 4:
        raise ValueError("captures: expected one to four records")
    # Enforce both record-count caps before reading any asset.
    if not isinstance(document["findings"], list) or len(document["findings"]) > 8:
        raise ValueError("findings: expected at most eight records")
    captures = {}
    for record in records:
        _keys(record, {"id", "state", "viewportWidth", "image", "source", "report"}, "capture")
        cid = _id(record["id"], "capture.id")
        if cid in captures:
            raise ValueError(f"Duplicate capture id: {cid}")
        captures[cid] = _capture(root, record)
    findings = _findings(document["findings"], captures)
    sheets = "".join(_sheet(data, findings) for data in captures.values())
    return '''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rendered evidence — controlled annotation example</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#17212b;font:16px/1.55 system-ui,sans-serif}
.page{max-width:1120px;margin:auto;padding:24px}h1{font-size:2rem;line-height:1.15;margin:0 0 16px}
h2{font-size:1.3rem;line-height:1.3;margin:0 0 8px}h3{font-size:1.05rem;line-height:1.4;margin:0 0 8px}
p{margin:0 0 12px;max-width:72ch}.meta,figcaption{font-size:.875rem;color:#35424d}
.sheet{margin-top:32px;padding-top:24px;border-top:1px solid #bac4cd}.sheet-grid{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:28px}
.sheet-grid>*{min-width:0}figure{margin:0}.capture-stage{position:relative;outline:1px solid #bac4cd}
img{display:block;width:100%;height:auto}.overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.overlay rect{fill:none;stroke:#005a9c;stroke-width:2;vector-effect:non-scaling-stroke}
.overlay text{font:700 12px system-ui;fill:#005a9c;stroke:#fff;stroke-width:3;paint-order:stroke}
#regions:not(:checked)~.sheet .overlay{visibility:hidden}.finding{margin-bottom:24px}
figcaption{margin-top:10px}code,pre{font-family:ui-monospace,monospace;font-size:.85em;white-space:pre-wrap;overflow-wrap:anywhere}
details{margin:24px 0}summary{cursor:pointer;font-weight:600}pre{padding:12px;background:#f4f6f8}
input{accent-color:#005a9c}input:focus-visible,summary:focus-visible{outline:3px solid #005a9c;outline-offset:3px}
footer{margin-top:32px;border-top:1px solid #bac4cd;padding-top:16px}::selection{background:#d4e7f6;color:#17212b}
@media(max-width:700px){.page{padding:16px}.sheet-grid{grid-template-columns:1fr}h1{font-size:1.6rem}}
</style></head><body><div class="page"><header><h1>Rendered evidence</h1>
<p>Two kinds of work stay separate: checking exact artifact bytes and judging what an observation means.</p>
<p class="meta">Optional, authored snapshot example. No automatic defect or conformance score.</p>
<p class="meta">Declared source revision: <code>''' + revision + '''</code></p></header>
<main><input id="regions" type="checkbox" checked aria-describedby="region-help"><label for="regions">Show authored regions</label>
<p id="region-help" class="meta">Toggle the marks to inspect the unchanged capture. Source-only notes have no region.</p>
''' + sheets + '''</main><footer><p class="meta">File bytes matched the supplied hashes during generation. This does not establish freshness, semantic truth, accessibility or user outcomes. No scripts or automatic network requests.</p></footer>
</div></body></html>'''


def write_new(output: Path, html: str) -> None:
    """Never overwrite an output or follow a linked parent, including missing leaves."""
    output = Path(output).absolute()
    if output.is_symlink():
        raise ValueError(f"Output link refused: {output.name}")
    for parent in output.parents:
        if parent.is_symlink():
            raise ValueError(f"Output parent link refused: {parent}")
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("x", encoding="utf-8", newline="\n") as stream:
        stream.write(html)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--annotations", required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        root = args.root.resolve(strict=True)
        document = json.loads(_read(root, args.annotations, MANIFEST_LIMIT))
        page = render(document, root)
        write_new(args.out, page)
    except (ValueError, OSError, UnicodeError) as error:
        print(f"Rejected: {error}", file=sys.stderr)
        return 2
    print(f"Wrote verified-byte snapshot: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

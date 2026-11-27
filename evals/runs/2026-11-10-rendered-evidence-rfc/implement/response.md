Let me read the three files from the workspace first.
The instructions say "do not run commands". Let me read the files directly.
Now let me also check the manifest.json if it exists:
Now I have a thorough understanding of everything needed. Let me implement `render.py`:

```python
"""
Offline evidence-viewer renderer — controlled prototype, not a public CLI command.

Usage:
    python3 render.py --root <dir> --annotations <rel-path> --out <abs-path>

Exit 0: success.  Exit 2: rejected input/output or I/O failure.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import os
import pathlib
import struct
import sys
import zlib
from typing import Any

# ---------------------------------------------------------------------------
# Prototype limits (design §5)
# ---------------------------------------------------------------------------
_MAX_MANIFEST = 256 * 1024          # bytes
_MAX_ASSET    = 2 * 1024 * 1024     # bytes
_MAX_CAPTURES = 4
_MAX_FINDINGS = 8
_MAX_TEXT     = 4096                # characters per prose field
_FORMAT       = "tasteforge.rendered-evidence.prototype.v1"

# Allowed fields per level (design §5, "unknown fields … are rejected")
_TOP_FIELDS      = {"format", "sourceRevision", "captures", "findings"}
_CAPTURE_FIELDS  = {"id", "state", "viewportWidth", "image", "source", "report"}
_FINDING_FIELDS  = {
    "id", "captureId", "kind", "title", "observation", "consequence",
    "applicability", "decision", "recheck", "limits", "sourceHint", "rect",
}
_ASSET_FIELDS    = {"path", "sha256"}
_PROSE_FIELDS    = {
    "title", "observation", "consequence", "applicability",
    "decision", "recheck", "limits",
}
_VALID_KINDS     = {
    "source-fact", "rendered-observation", "historical-runtime",
    "contextual-judgment", "unassessed",
}
_VALID_DECISIONS = {"keep", "adapt", "remove", "unassessed"}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fail(msg: str) -> None:
    print(msg, file=sys.stderr)
    sys.exit(2)


def _esc(text: str) -> str:
    return html.escape(str(text), quote=True)


def _sha256_file(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _png_dimensions(data: bytes) -> tuple[int, int]:
    """Return (width, height) from raw PNG bytes; raise ValueError if not a valid PNG IHDR."""
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG")
    # IHDR chunk starts at byte 8: 4-len, 4-type, 13-data
    if data[12:16] != b"IHDR":
        raise ValueError("missing IHDR")
    w, h = struct.unpack(">II", data[16:24])
    if w <= 0 or h <= 0:
        raise ValueError("non-positive PNG dimensions")
    if w * h > 16_000_000:
        raise ValueError("PNG exceeds 16 million pixels")
    return w, h


# ---------------------------------------------------------------------------
# Path safety (design §7)
# ---------------------------------------------------------------------------

def _safe_relative(raw: str, root: pathlib.Path) -> pathlib.Path:
    """Resolve a repository-relative POSIX path; reject traversal/absolute/backslash."""
    if "\\" in raw:
        _fail(f"Rejected path (backslash not allowed): {raw!r}")
    p = pathlib.PurePosixPath(raw)
    if p.is_absolute():
        _fail(f"Rejected path (absolute not allowed): {raw!r}")
    parts = p.parts
    for part in parts:
        if part in (".", ".."):
            _fail(f"Rejected path (dot/traversal component): {raw!r}")
    resolved = root.joinpath(*parts)
    # Confirm it stays inside root
    try:
        resolved.relative_to(root)
    except ValueError:
        _fail(f"Rejected path (outside root): {raw!r}")
    return resolved


def _check_regular_file(path: pathlib.Path, label: str) -> None:
    """Fail if path is not a regular file (rejects symlinks, hardlink aliases, etc.)."""
    try:
        st = path.stat(follow_symlinks=False)
    except FileNotFoundError:
        _fail(f"Asset not found: {label}")
    # stat.S_ISREG
    import stat as _stat
    if not _stat.S_ISREG(st.st_mode):
        _fail(f"Rejected link (not a regular file): {label}")
    # Hardlink check: nlink > 1 means multiple directory entries point to this inode
    if st.st_nlink > 1:
        _fail(f"Rejected link (hardlink alias detected): {label}")


def _read_asset(path: pathlib.Path, label: str, limit: int = _MAX_ASSET) -> bytes:
    """Read a regular, non-linked file within the byte limit."""
    _check_regular_file(path, label)
    data = path.read_bytes()
    if len(data) > limit:
        _fail(f"Asset exceeds size limit ({limit} bytes): {label}")
    return data


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _check_unknown(obj: dict, allowed: set[str], context: str) -> None:
    unknown = set(obj) - allowed
    if unknown:
        name = next(iter(unknown))
        _fail(f"Unknown field {name!r} in {context} (extra)")


def _require_str(obj: dict, key: str, context: str, max_len: int = _MAX_TEXT) -> str:
    val = obj.get(key)
    if not isinstance(val, str) or not val:
        _fail(f"Field {key!r} must be a non-empty string in {context}")
    if len(val) > max_len:
        _fail(f"Field {key!r} exceeds {max_len} characters in {context} ({key})")
    return val


def _validate_asset(obj: Any, context: str) -> dict:
    if not isinstance(obj, dict):
        _fail(f"Asset in {context} must be an object")
    _check_unknown(obj, _ASSET_FIELDS, context)
    if not isinstance(obj.get("path"), str) or not obj["path"]:
        _fail(f"Asset path missing in {context} (path)")
    if not isinstance(obj.get("sha256"), str) or len(obj["sha256"]) != 64:
        _fail(f"Asset sha256 missing/invalid in {context}")
    return obj


# ---------------------------------------------------------------------------
# Document validation and asset loading
# ---------------------------------------------------------------------------

def _validate_document(doc: dict) -> None:
    """Check format, field set and counts before any asset I/O."""
    if not isinstance(doc, dict):
        _fail("Manifest must be a JSON object")
    _check_unknown(doc, _TOP_FIELDS, "top-level")
    if doc.get("format") != _FORMAT:
        _fail(f"Unsupported format {doc.get('format')!r} (format)")
    rev = doc.get("sourceRevision")
    if not isinstance(rev, str) or len(rev) != 40 or not all(c in "0123456789abcdef" for c in rev):
        _fail("sourceRevision must be a 40-character lowercase hex string")
    caps = doc.get("captures")
    if not isinstance(caps, list):
        _fail("captures must be a list")
    if len(caps) > _MAX_CAPTURES:
        _fail(f"Too many captures (max {_MAX_CAPTURES}) (captures)")
    if len(caps) == 0:
        _fail("captures must have at least one entry")
    finds = doc.get("findings")
    if not isinstance(finds, list):
        _fail("findings must be a list")
    if len(finds) > _MAX_FINDINGS:
        _fail(f"Too many findings (max {_MAX_FINDINGS}) (findings)")

    for cap in caps:
        if not isinstance(cap, dict):
            _fail("Each capture must be an object")
        _check_unknown(cap, _CAPTURE_FIELDS, f"capture {cap.get('id')!r}")
        _require_str(cap, "id", "capture")
        cap_id = cap["id"]
        if len(cap_id) > 64:
            _fail(f"Capture id too long: {cap_id!r}")
        if cap_id != cap_id.lower():
            _fail(f"Capture id must be lowercase: {cap_id!r}")
        _require_str(cap, "state", f"capture {cap_id!r}")
        if not isinstance(cap.get("viewportWidth"), int) or isinstance(cap.get("viewportWidth"), bool):
            _fail(f"viewportWidth must be an integer in capture {cap_id!r}")
        for asset_key in ("image", "source", "report"):
            _validate_asset(cap.get(asset_key), f"capture {cap_id!r} {asset_key}")

    # Capture ID uniqueness
    cap_ids = [c["id"] for c in caps]
    seen_caps: set[str] = set()
    for cid in cap_ids:
        if cid in seen_caps:
            _fail(f"Duplicate capture id: {cid!r}")
        seen_caps.add(cid)

    # Findings
    seen_find: set[str] = set()
    for f in finds:
        if not isinstance(f, dict):
            _fail("Each finding must be an object")
        _check_unknown(f, _FINDING_FIELDS, f"finding {f.get('id')!r}")
        _require_str(f, "id", "finding")
        fid = f["id"]
        if fid in seen_find:
            _fail(f"Duplicate finding id: {fid!r} (visible)")
        seen_find.add(fid)
        for prose in _PROSE_FIELDS:
            _require_str(f, prose, f"finding {fid!r}")
        cid_ref = f.get("captureId")
        if not isinstance(cid_ref, str) or cid_ref not in seen_caps:
            _fail(f"Unresolved captureId {cid_ref!r} in finding {fid!r} ({cid_ref})")
        if f.get("kind") not in _VALID_KINDS:
            _fail(f"Invalid kind {f.get('kind')!r} in finding {fid!r}")
        if f.get("decision") not in _VALID_DECISIONS:
            _fail(f"Invalid decision {f.get('decision')!r} in finding {fid!r}")
        hint = f.get("sourceHint")
        if hint is not None and not isinstance(hint, str):
            _fail(f"sourceHint must be a string or null in finding {fid!r}")


def _validate_rect(rect: Any, png_w: int, png_h: int, fid: str) -> None:
    if rect is None:
        return
    if not isinstance(rect, list) or len(rect) != 4:
        _fail(f"rect must be [x, y, w, h] or null in finding {fid!r} ({fid})")
    for v in rect:
        if isinstance(v, bool) or not isinstance(v, int):
            _fail(f"rect values must be integers (not bool/float) in finding {fid!r} ({fid})")
    x, y, rw, rh = rect
    if x < 0 or y < 0:
        _fail(f"rect x/y must be non-negative in finding {fid!r} ({fid})")
    if rw <= 0 or rh <= 0:
        _fail(f"rect width/height must be positive in finding {fid!r} ({fid})")
    if x + rw > png_w or y + rh > png_h:
        _fail(f"rect extends outside image bounds in finding {fid!r} ({fid})")


# ---------------------------------------------------------------------------
# Core render
# ---------------------------------------------------------------------------

def render(document: dict, root: pathlib.Path) -> str:  # noqa: C901
    """Validate document and assets, return deterministic self-contained HTML."""
    _validate_document(document)

    captures = document["captures"]
    findings = document["findings"]

    # ---- Asset verification ------------------------------------------------
    cap_data: dict[str, dict] = {}  # cap id → enriched info

    for cap in captures:
        cid = cap["id"]
        state = cap["state"]
        vw = cap["viewportWidth"]

        # Resolve and verify each asset
        img_spec   = cap["image"]
        src_spec   = cap["source"]
        rep_spec   = cap["report"]

        img_path = _safe_relative(img_spec["path"], root)
        src_path = _safe_relative(src_spec["path"], root)
        rep_path = _safe_relative(rep_spec["path"], root)

        img_bytes = _read_asset(img_path, img_spec["path"])
        src_bytes = _read_asset(src_path, src_spec["path"])
        rep_bytes = _read_asset(rep_path, rep_spec["path"])

        # Hash checks
        if hashlib.sha256(img_bytes).hexdigest() != img_spec["sha256"]:
            _fail(f"Hash mismatch for image asset: {img_spec['path']}")
        if hashlib.sha256(src_bytes).hexdigest() != src_spec["sha256"]:
            _fail(f"Hash mismatch for source asset: {src_spec['path']}")
        if hashlib.sha256(rep_bytes).hexdigest() != rep_spec["sha256"]:
            _fail(f"Hash mismatch for report asset: {rep_spec['path']}")

        # PNG validation
        try:
            png_w, png_h = _png_dimensions(img_bytes)
        except ValueError as exc:
            _fail(f"Invalid PNG for capture {cid!r}: {exc} (PNG)")

        # Parse report JSON
        try:
            report = json.loads(rep_bytes)
        except json.JSONDecodeError as exc:
            _fail(f"Invalid JSON in report for capture {cid!r}: {exc}")

        # Cross-check: report.sourceSha256 must match declared source hash
        report_src_hash = report.get("sourceSha256", "")
        if report_src_hash != src_spec["sha256"]:
            _fail(
                f"Report sourceSha256 does not match declared source hash "
                f"for capture {cid!r} (source)"
            )

        # Bind capture: find matching entry in report.captures by basename, state, width
        img_basename = pathlib.PurePosixPath(img_spec["path"]).name
        matched = [
            rc for rc in report.get("captures", [])
            if (
                rc.get("file") == img_basename
                and rc.get("state") == state
                and rc.get("width") == vw
            )
        ]
        if len(matched) != 1:
            _fail(
                f"Could not uniquely bind capture {cid!r} to a report entry "
                f"(basename={img_basename!r}, state={state!r}, width={vw}) ({cid})"
            )
        rc = matched[0]

        cap_data[cid] = {
            "id": cid,
            "state": state,
            "viewportWidth": vw,
            "png_w": png_w,
            "png_h": png_h,
            "img_b64": base64.b64encode(img_bytes).decode(),
            "img_path": img_spec["path"],
            "src_path": src_spec["path"],
            "rep_path": rep_spec["path"],
            "browser": report.get("browser", ""),
            "scrollY": rc.get("scrollY"),
            "framing": rc.get("framing"),
            "active": rc.get("active"),
            "src_hash": src_spec["sha256"],
            "img_hash": img_spec["sha256"],
            "rep_hash": rep_spec["sha256"],
        }

    # ---- Rect validation (after PNG dims are known) ------------------------
    cap_dim = {cid: (d["png_w"], d["png_h"]) for cid, d in cap_data.items()}
    for f in findings:
        fid = f["id"]
        cid = f["captureId"]
        pw, ph = cap_dim[cid]
        _validate_rect(f.get("rect"), pw, ph, fid)

    # ---- Build HTML --------------------------------------------------------
    source_rev = document["sourceRevision"]

    sections: list[str] = []

    for cap in captures:
        cid = cap["id"]
        d = cap_data[cid]
        cap_findings = [f for f in findings if f["captureId"] == cid]

        # SVG overlay rectangles (findings with non-null rect)
        rects_svg = ""
        for f in cap_findings:
            rect = f.get("rect")
            if rect is None:
                continue
            x, y, rw, rh = rect
            fid_esc = _esc(f["id"])
            rects_svg += (
                f'<rect data-finding="{fid_esc}" '
                f'x="{x}" y="{y}" width="{rw}" height="{rh}" '
                f'fill="none" stroke="#e05" stroke-width="2" />\n'
            )

        vb_w = d["png_w"]
        vb_h = d["png_h"]
        img_b64 = d["img_b64"]
        img_src = f"data:image/png;base64,{img_b64}"

        # Metadata rows
        meta_rows = ""
        meta_rows += f"<tr><th>Capture</th><td>{_esc(cid)}</td></tr>\n"
        meta_rows += f"<tr><th>State</th><td>{_esc(d['state'])}</td></tr>\n"
        meta_rows += f"<tr><th>Recorded viewport width (CSS px)</th><td>{_esc(str(d['viewportWidth']))}</td></tr>\n"
        meta_rows += f"<tr><th>Image dimensions (px)</th><td>{vb_w} × {vb_h}</td></tr>\n"
        if d["browser"]:
            meta_rows += f"<tr><th>Browser</th><td>{_esc(d['browser'])}</td></tr>\n"
        if d["framing"] is not None:
            meta_rows += f"<tr><th>Framing</th><td>{_esc(str(d['framing']))}</td></tr>\n"
        if d["scrollY"] is not None:
            meta_rows += f"<tr><th>Recorded scroll Y (natural px)</th><td>{_esc(str(d['scrollY']))}</td></tr>\n"
        else:
            meta_rows += "<tr><th>Scroll Y</th><td><em>unrecorded</em></td></tr>\n"
        meta_rows += "<tr><th>Scroll X</th><td><em>unrecorded</em></td></tr>\n"
        meta_rows += "<tr><th>Image-time DPR</th><td><em>unrecorded</em></td></tr>\n"
        meta_rows += "<tr><th>Per-capture CSS viewport height</th><td><em>unrecorded</em></td></tr>\n"
        if d["active"]:
            active = d["active"]
            active_str = active.get("tag", "")
            if active.get("name"):
                active_str += f" name={active['name']!r}"
            meta_rows += f"<tr><th>Active element (recorded)</th><td>{_esc(active_str)}</td></tr>\n"
        meta_rows += (
            f"<tr><th>Image SHA-256</th>"
            f"<td><code>{_esc(d['img_hash'])}</code></td></tr>\n"
        )
        meta_rows += (
            f"<tr><th>Source SHA-256</th>"
            f"<td><code>{_esc(d['src_hash'])}</code></td></tr>\n"
        )
        meta_rows += (
            f"<tr><th>Report SHA-256</th>"
            f"<td><code>{_esc(d['rep_hash'])}</code></td></tr>\n"
        )

        # Finding cards
        finding_cards = ""
        for f in cap_findings:
            fid = f["id"]
            has_rect = f.get("rect") is not None
            region_note = (
                f'<p class="region-note">Region: <code>{_esc(fid)}</code> '
                f'(see overlay)</p>'
                if has_rect
                else '<p class="region-note source-only">Source-only / unassessed — no region drawn.</p>'
            )
            hint_html = ""
            if f.get("sourceHint") is not None:
                hint_html = (
                    f'<p><strong>Source hint</strong> '
                    f'(display-only, not an instruction): '
                    f'<code class="source-hint">{_esc(f["sourceHint"])}</code></p>'
                )
            finding_cards += f"""
<div class="finding" id="finding-{_esc(fid)}">
  <h4>{_esc(f['title'])}</h4>
  <p><span class="badge kind">{_esc(f['kind'])}</span>
     <span class="badge decision">{_esc(f['decision'])}</span></p>
  {region_note}
  <p><strong>Observation:</strong> {_esc(f['observation'])}</p>
  <p><strong>Consequence:</strong> {_esc(f['consequence'])}</p>
  <p><strong>Applicability:</strong> {_esc(f['applicability'])}</p>
  <p><strong>Decision:</strong> {_esc(f['decision'])}</p>
  <p><strong>Recheck:</strong> {_esc(f['recheck'])}</p>
  <p><strong>Limits:</strong> {_esc(f['limits'])}</p>
  {hint_html}
</div>
"""

        sections.append(f"""
<section class="capture-sheet" id="cap-{_esc(cid)}">
  <h2>Evidence sheet: {_esc(cid)} / {_esc(d['state'])}</h2>
  <details open>
    <summary>Capture metadata</summary>
    <table class="meta-table"><tbody>
      {meta_rows}
    </tbody></table>
  </details>

  <div class="stage-wrap">
    <label class="toggle-label">
      <input type="checkbox" class="region-toggle" checked>
      Show authored regions
    </label>
    <div class="stage">
      <svg class="overlay" viewBox="0 0 {vb_w} {vb_h}"
           xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true">
        <image href="{img_src}" x="0" y="0"
               width="{vb_w}" height="{vb_h}" />
        {rects_svg}
      </svg>
    </div>
  </div>

  <h3>Findings for this capture</h3>
  {finding_cards}
</section>
""")

    sections_html = "\n".join(sections)

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Evidence viewer — rendered-evidence prototype</title>
<style>
*,*::before,*::after{{box-sizing:border-box}}
body{{font-family:system-ui,sans-serif;color:#111;background:#fff;
     margin:0;padding:1.5rem 1rem;max-width:900px;margin-inline:auto;line-height:1.5}}
h1{{font-size:1.3rem;border-bottom:2px solid #111;padding-bottom:.4rem}}
h2{{font-size:1.1rem;margin-top:2rem;border-bottom:1px solid #ccc;padding-bottom:.3rem}}
h3{{font-size:1rem;margin-top:1.5rem}}
h4{{font-size:.95rem;margin:.8rem 0 .3rem}}
.meta-table{{border-collapse:collapse;font-size:.85rem;width:100%}}
.meta-table th,.meta-table td{{text-align:left;padding:.25rem .4rem;
  border:1px solid #ddd;vertical-align:top}}
.meta-table th{{background:#f6f6f6;white-space:nowrap;width:14rem}}
.stage-wrap{{margin:1rem 0}}
.toggle-label{{display:flex;gap:.5rem;align-items:center;
  font-size:.85rem;cursor:pointer;user-select:none;margin-bottom:.5rem}}
.stage{{display:block;width:100%;overflow:auto;border:1px solid #ccc}}
.overlay{{display:block;width:100%;height:auto}}
.overlay rect{{transition:opacity .15s}}
.region-toggle:not(:checked)~* .overlay rect,
.stage-wrap:has(.region-toggle:not(:checked)) .overlay rect{{opacity:0}}
.finding{{border:1px solid #ddd;border-radius:4px;padding:.8rem 1rem;margin:.8rem 0}}
.badge{{display:inline-block;font-size:.75rem;padding:.1rem .4rem;
  border-radius:3px;margin-right:.4rem;background:#eee;color:#333}}
.badge.kind{{background:#def;color:#036}}
.badge.decision{{background:#ffd;color:#550}}
.region-note{{font-size:.82rem;color:#555;margin:.3rem 0}}
.source-only{{color:#777;font-style:italic}}
.source-hint{{font-size:.82rem;word-break:break-all}}
code{{font-size:.82rem;background:#f4f4f4;padding:.05rem .25rem;border-radius:3px}}
.notice{{border:1px solid #c8d;background:#fdf;padding:.7rem 1rem;
  border-radius:4px;font-size:.85rem;margin:1rem 0}}
details{{margin:.5rem 0}}summary{{cursor:pointer;font-weight:600}}
</style>
</head>
<body>
<h1>Evidence viewer — rendered-evidence prototype</h1>
<div class="notice">
  <strong>Prototype scope:</strong>
  This viewer presents authored annotations bound to exact verified screenshot
  bytes and a declared source revision. Byte verification establishes which
  artifact was read; it does not certify accessibility, usability, or
  conformance. Screenshot controls are static evidence, not interactive
  viewer controls. Authored text is display-only.
  Source revision: <code>{_esc(source_rev)}</code>.
</div>

{sections_html}

<footer style="margin-top:3rem;font-size:.8rem;color:#777;border-top:1px solid #eee;padding-top:.8rem">
  Generated by rendered-evidence prototype (tasteforge.rendered-evidence.prototype.v1).
  No remote requests, scripts or automatic network activity.
</footer>
</body>
</html>"""

    return page


# ---------------------------------------------------------------------------
# write_new
# ---------------------------------------------------------------------------

def write_new(output: pathlib.Path, html: str) -> None:
    """Write html to output; refuse if output exists or any parent is a symlink."""
    if output.exists():
        _fail(f"Output already exists (will not overwrite): {output.name} ({output})")
    # Check all parent components for symlinks
    p = output.parent
    while True:
        try:
            st = p.lstat()
        except FileNotFoundError:
            break  # doesn't exist yet — fine
        import stat as _stat
        if _stat.S_ISLNK(st.st_mode):
            _fail(f"Rejected output: parent component is a symbolic link (link): {p}")
        if p.parent == p:
            break
        p = p.parent

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html, encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _cli() -> None:
    parser = argparse.ArgumentParser(
        prog="render.py",
        description="Offline evidence-viewer renderer (prototype, not a public CLI command).",
    )
    parser.add_argument("--root", required=True, type=pathlib.Path,
                        help="Root directory for asset resolution.")
    parser.add_argument("--annotations", required=True,
                        help="Repository-relative path to the annotations JSON manifest.")
    parser.add_argument("--out", required=True, type=pathlib.Path,
                        help="Output HTML path (must not exist).")
    args = parser.parse_args()

    root: pathlib.Path = args.root.resolve()
    if not root.is_dir():
        _fail(f"Root is not a directory: {root}")

    # Resolve manifest path
    ann_path = _safe_relative(args.annotations, root)
    _check_regular_file(ann_path, "annotations.json")
    ann_bytes = ann_path.read_bytes()
    if len(ann_bytes) > _MAX_MANIFEST:
        _fail(f"Manifest exceeds size limit ({_MAX_MANIFEST} bytes) (annotations.json)")

    try:
        document = json.loads(ann_bytes)
    except json.JSONDecodeError as exc:
        _fail(f"Invalid JSON in manifest: {exc}")

    # Render (all validation and asset I/O happen here)
    html_out = render(document, root)

    # Write only after successful rendering
    write_new(args.out, html_out)


if __name__ == "__main__":
    try:
        _cli()
    except SystemExit:
        raise
    except Exception as exc:  # pragma: no cover
        print(f"Internal error: {exc}", file=sys.stderr)
        sys.exit(2)
```

---

A few implementation decisions worth noting:

- **`_check_regular_file`** rejects symlinks via `lstat()` and hardlinks via `st_nlink > 1` — matching both sub-tests in `test_absolute_traversal_and_linked_assets_are_not_read`.
- **`write_new`** walks every parent with `lstat()` to catch symlinked directories before writing.
- **SVG `viewBox`** uses actual PNG pixel dimensions (`png_w × png_h`), independent of `viewportWidth` — satisfying `test_capture_pixels_are_not_reinterpreted_as_css_viewport_pixels`.
- **`<rect data-finding="…">`** carries the finding ID so `Tags.regions` picks it up; source-only findings (`rect=None`) produce no `<rect>`.
- **Toggle**: a native `<input type="checkbox" class="region-toggle">` with an associated `<label>` inside `.stage-wrap`; the CSS `:has()` selector hides rects when unchecked.
- **Scroll Y** is sourced from the matched `report.captures` entry and printed verbatim — `"12"` in the fixture passes the `assertIn("12", text)` check.
- **`assertNotIn(str(self.root), text)`**: asset paths are never emitted into the HTML (only basenames/hashes appear in the metadata table).
- **Escape**: all prose and hint fields go through `html.escape()`.
- **Determinism**: no timestamps, random values or mutable state — same inputs → identical bytes.


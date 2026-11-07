"""Verify that every declared creator version hash matches the bytes on disk."""

import hashlib
import json
import sys
from pathlib import Path

run = Path(__file__).resolve().parents[1]
codes = 0
for cell in sys.argv[1:]:
    base = run / "cells" / cell / "initial"
    record_path = base / "creator-record.json"
    if not record_path.exists():
        print(f"{cell}: NO creator-record.json")
        codes = 1
        continue
    record = json.loads(record_path.read_text(encoding="utf-8"))
    print(f"=== {cell} ===")
    for version in record.get("versions", []):
        file = base / version["file"]
        if not file.exists():
            print(f"  MISSING {version['file']}")
            codes = 1
            continue
        actual = hashlib.sha256(file.read_bytes()).hexdigest()
        declared = version["sha256"]
        status = "ok" if actual == declared else "MISMATCH"
        if actual != declared:
            codes = 1
        print(f"  {version['file']}: {status} {actual[:16]}")
    index = base / "index.html"
    if index.exists():
        actual = hashlib.sha256(index.read_bytes()).hexdigest()
        # Records use different schemas; a missing declared hash is reported as
        # absent rather than as a mismatch, because the bytes are what matter and
        # their identity is checked against the last kept version below.
        declared = record.get("submitted_sha256")
        if declared is None:
            print(f"  index.html: no declared hash in record {actual[:16]}")
        else:
            status = "ok" if actual == declared else "MISMATCH"
            if actual != declared:
                codes = 1
            print(f"  index.html: {status} {actual[:16]}")
        # Byte identity with the last kept version is what the protocol requires.
        last = record["versions"][-1]["file"]
        same = (base / last).read_bytes() == index.read_bytes()
        print(f"  index.html == {last}: {same}")
        if not same:
            codes = 1
    else:
        print("  MISSING index.html")
        codes = 1
    print(f"  loaded paths: {len(record.get('loaded_skill_paths', []))}")
    for path in record.get("loaded_skill_paths", []):
        print(f"    - {path}")
sys.exit(codes)

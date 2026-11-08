"""Verify the exact anonymous packet and return its manifest digest."""
from pathlib import Path
import hashlib
import json
import sys
import tempfile


def verify_manifest(packet):
    manifest = packet / "hashes.json"
    expected = json.loads(manifest.read_text())
    actual = {str(p.relative_to(packet)) for p in packet.rglob("*") if p.is_file() and p != manifest}
    assert actual == set(expected), "Review packet file set changed"
    for name, digest in expected.items():
        file = packet / name
        assert file.resolve().is_relative_to(packet.resolve()), "Packet path escapes root"
        assert hashlib.sha256(file.read_bytes()).hexdigest() == digest, f"Review packet bytes changed: {name}"
    return hashlib.sha256(manifest.read_bytes()).hexdigest()


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        with tempfile.TemporaryDirectory() as folder:
            packet = Path(folder)
            source = packet / "source.html"
            source.write_bytes(b"original")
            manifest = packet / "hashes.json"
            manifest.write_text(json.dumps({"source.html": hashlib.sha256(source.read_bytes()).hexdigest()}))
            source.write_bytes(b"changed")
            try:
                verify_manifest(packet)
            except AssertionError:
                pass
            else:
                raise AssertionError("Modified review packet was accepted")
            source.write_bytes(b"original")
            assert verify_manifest(packet) == hashlib.sha256(manifest.read_bytes()).hexdigest()
            (packet / "unlisted.txt").write_text("unreviewed extra")
            try:
                verify_manifest(packet)
            except AssertionError:
                pass
            else:
                raise AssertionError("Unlisted review packet file was accepted")
        print("Packet integrity checks passed: changed bytes and unlisted files rejected.")
    else:
        print(verify_manifest(Path(sys.argv[1])))

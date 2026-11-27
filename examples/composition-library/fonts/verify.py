#!/usr/bin/env python3
"""Verify gallery font sources and bounded cmap samples; no third-party modules.

Default is offline. --download fetches only pinned, hash-checked missing files.
--cache DIR reads/writes a SHA-256-addressed cache for disconnected reproduction.
This checks cmap mappings, not shaping, rasterization, all weights, or all scripts.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import urllib.request


def glyphs(data, points):
    """Resolve Unicode cmap format 4/12 mappings for the requested code points."""
    u16 = lambda at: struct.unpack_from('>H', data, at)[0]
    u32 = lambda at: struct.unpack_from('>I', data, at)[0]
    tables = {data[12 + i * 16:16 + i * 16]: u32(20 + i * 16)
              for i in range(u16(4))}
    cmap = tables[b'cmap']
    found = set()
    formats = set()
    for i in range(u16(cmap + 2)):
        at = cmap + 4 + i * 8
        platform, encoding = u16(at), u16(at + 2)
        if platform != 0 and (platform, encoding) not in [(3, 1), (3, 10)]:
            continue
        sub = cmap + u32(at + 4)
        fmt = u16(sub)
        formats.add(fmt)
        if fmt == 12:
            for j in range(u32(sub + 12)):
                start, end, first = struct.unpack_from('>III', data, sub + 16 + j * 12)
                found.update(p for p in points if start <= p <= end and first + p - start)
        elif fmt == 4:
            n = u16(sub + 6) // 2
            ends = sub + 14
            starts = ends + n * 2 + 2
            deltas = starts + n * 2
            offsets = deltas + n * 2
            for j in range(n):
                for p in points:
                    if u16(starts + j * 2) <= p <= u16(ends + j * 2):
                        offset = u16(offsets + j * 2)
                        gid = u16(offsets + j * 2 + offset + (p - u16(starts + j * 2)) * 2) if offset else p
                        if gid and ((gid + u16(deltas + j * 2)) & 65535):
                            found.add(p)
    return found, sorted(formats)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true')
    parser.add_argument('--cache', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    manifest = json.loads((root / 'specimens.json').read_text())
    results = []
    for item in manifest['specimens']:
        for local, digest, url in [
            (item['file'], item['fontSha256'], item['fontUrl']),
            (item['licenseFile'], item['licenseSha256'], item['licenseUrl']),
            (item['metadataFile'], item['metadataSha256'], item['metadataUrl']),
        ]:
            path = root / local
            cached = args.cache / digest if args.cache else None
            if not path.exists():
                if cached and cached.exists():
                    raw = cached.read_bytes()
                elif args.download:
                    raw = urllib.request.urlopen(url, timeout=30).read()
                else:
                    raise SystemExit(f'Missing {local}; provide --cache or --download')
                assert hashlib.sha256(raw).hexdigest() == digest, f'Hash mismatch: {local}'
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(raw)
            raw = path.read_bytes()
            assert hashlib.sha256(raw).hexdigest() == digest, f'Hash mismatch: {local}'
            if cached:
                cached.parent.mkdir(parents=True, exist_ok=True)
                cached.write_bytes(raw)
        metadata = (root / item['metadataFile']).read_text()
        assert 'license: "OFL"' in metadata
        license_text = (root / item['licenseFile']).read_text()
        assert 'SIL OPEN FONT LICENSE Version 1.1' in license_text
        assert 'Copyright' in license_text
        samples = {}
        data = (root / item['file']).read_bytes()
        for language, sample in manifest['coverageSamples'].items():
            points = set(map(ord, sample))
            present, formats = glyphs(data, points)
            missing = sorted(points - present)
            samples[language] = {'uniqueCodePoints': len(points), 'cmapFormats': formats,
                                 'missing': [f'U+{p:04X}' for p in missing]}
            if language in item['languages']:
                assert not missing, f'{item["id"]}: missing declared {language} sample {missing}'
                assert f'subsets: "{dict(en="latin", vi="vietnamese")[language]}"' in metadata
        results.append({'id': item['id'], 'fontSha256': item['fontSha256'], 'samples': samples})
    result = {'check': 'Pinned bytes, original OFL notice, metadata subset, sampled cmap mappings',
              'limitations': 'Not a full script certificate, shaping test, or rendered/browser check.',
              'specimens': results}
    output = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.write_text(output)
    else:
        print(output, end='')


if __name__ == '__main__':
    main()

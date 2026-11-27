"""Verify composition/manifest bindings; optionally refetch exact pinned bytes."""
import argparse
import hashlib
import json
from pathlib import Path
import urllib.request

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--fetch', action='store_true', help='Read only the exact pinned HTTPS inputs and notices to verify hashes; execute nothing')
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
gallery = root / 'examples/composition-library'
manifest = json.loads((gallery / 'source-manifest.json').read_text())
library = json.loads((root / 'packages/knowledge/src/data/compositions.json').read_text())
inputs = {(item['repo'], item['revision'], item['path']): item for item in manifest['inputs']}
assert len(inputs) == len(library['sources']) == 13
checked = set()
for source in library['sources']:
    repo = source['url'].removeprefix('https://github.com/')
    item = inputs[(repo, source['revision'], source['path'])]
    assert source['inputSha256'] == item['sha256']
    assert source['licenseUrl'] == item['licenseUrl']
    assert source['pinnedUrl'] == f"https://github.com/{repo}/blob/{source['revision']}/{source['path']}"
    assert source['license'] == 'MIT'
    cached = root / item['cache']
    if cached.exists():
        assert hashlib.sha256(cached.read_bytes()).hexdigest() == item['sha256']
    if args.fetch:
        for url, digest in [(item['url'], item['sha256']), (item['licenseUrl'], item['licenseSha256'])]:
            if url not in checked:
                assert url.startswith(f"https://raw.githubusercontent.com/{repo}/{source['revision']}/")
                assert hashlib.sha256(urllib.request.urlopen(url).read()).hexdigest() == digest
                checked.add(url)
source_ids = {source['id'] for source in library['sources']}
assert len(library['entries']) == 12
for group in ['work', 'commerce', 'reading', 'exploration']:
    assert sum(entry['group'] == group for entry in library['entries']) == 3
for entry in library['entries']:
    assert set(entry['sourceIds']) <= source_ids
    assert len(entry['artDirection']) == 2
print(f"Verified 13 source/manifest bindings, 12 entries and 2 decisions per entry; {len(checked)} exact remote byte inputs checked.")

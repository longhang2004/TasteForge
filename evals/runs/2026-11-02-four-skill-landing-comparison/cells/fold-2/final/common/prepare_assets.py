"""Prepare original common artifacts and optional licensed font files; no UI output."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import shutil
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

common = Path(__file__).resolve().parent
run = common.parent
repo = run.parents[2]
started = "2026-11-02T14:08:56Z"
headers = {"User-Agent": "TasteForge-common-asset-preflight"}
failures = []
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30).read()
def request_json(url):
    return json.loads(get(url))
def svg(name, body):
    target = common / "assets" / name
    assert not target.exists(), f"Do not overwrite original artifact: {target}"
    target.write_text(body, encoding="utf-8")
    ET.parse(target)

svg("field-fold-map.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 840" role="img" aria-labelledby="title desc">
<title id="title">Field Fold original schematic map illustration</title><desc id="desc">Two overlapping paper shapes show an invented street grid, water, and numbered observation points. This is a fictional geometric schematic, not a navigation map or photograph.</desc>
<rect width="1200" height="840" fill="#e9e3d6"/><path d="M110 84h857v641H110z" fill="#f9f5e9" stroke="#c1b8a3" stroke-width="2"/>
<path d="M734 84h233v641H734z" fill="#f0ebde"/><path d="M347 84v641M551 84v641M756 84v641" stroke="#d2c8b3" stroke-width="2" stroke-dasharray="7 9"/>
<path d="M111 542C286 415 332 540 469 450S678 339 967 388v210c-188-57-318-8-484 64S228 679 111 707z" fill="#8eaaa9"/>
<g fill="none" stroke="#b7ad97" stroke-width="12"><path d="M167 190h727M167 286h727M167 382h312M167 479h146M199 138v376M302 138v348M405 138v284M508 138v231M611 138v199M714 138v196M817 138v202M897 138v220"/><path d="M599 654h288M702 613v83M804 590v106M892 615v81"/></g>
<path d="m216 242 194 90 188-112 194 75" fill="none" stroke="#a5492a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#a5492a" stroke="#f9f5e9" stroke-width="6"><circle cx="216" cy="242" r="25"/><circle cx="410" cy="332" r="25"/><circle cx="598" cy="220" r="25"/><circle cx="792" cy="295" r="25"/></g>
<g fill="#fffaf0" font-family="sans-serif" font-size="21" text-anchor="middle"><text x="216" y="250">1</text><text x="410" y="340">2</text><text x="598" y="228">3</text><text x="792" y="303">4</text></g>
<g font-family="sans-serif" fill="#3f4941"><text x="160" y="650" font-size="22" letter-spacing="3">FIELD FOLD</text><text x="160" y="684" font-size="15" letter-spacing="2">SCHEMATIC KIT PREVIEW</text></g>
<path d="m966 205 124 35-39 388-85 21z" fill="#c9bda5" stroke="#a39479" stroke-width="2"/><path d="m991 254 65 18M987 290l65 18M983 326l64 18M979 362l64 18M975 398l64 18" stroke="#8d806b" stroke-width="3"/>
<rect x="110" y="757" width="980" height="44" fill="#e9e3d6"/><text x="111" y="785" font-family="sans-serif" font-size="20" fill="#566054">Original geometric schematic · not a navigation map or photograph</text>
</svg>''')
svg("field-fold-contents.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
<title id="title">Field Fold schematic kit contents</title><desc id="desc">An original diagram labels two A3 foldout prints, one paper sleeve and numbered route-note cards. The arrangement does not establish card count, materials, edition design or print finish.</desc>
<rect width="1200" height="720" fill="#f1ede3"/>
<path d="M90 130h360v345H90z" fill="#fff9e9" stroke="#a99c84" stroke-width="2"/><path d="M130 94h360v345H130z" fill="#faf5e9" stroke="#a99c84" stroke-width="2"/>
<path d="M190 140v238M250 140v238M310 140v238M370 140v238M170 185h270M170 245h270M170 305h270M170 365h270" fill="none" stroke="#c5bda9" stroke-width="7"/>
<path d="M131 310c90-90 181 55 359-63v82c-183 60-218-35-359 70z" fill="#91aead"/><path d="m185 220 78 64 91-98 67 56" fill="none" stroke="#a5492a" stroke-width="8"/>
<path d="M550 160h260v300H550z" fill="#c2ae88" stroke="#9e8b68" stroke-width="2"/><path d="M550 160h260l-130 65z" fill="#d1bf9b" stroke="#9e8b68" stroke-width="2"/><text x="680" y="342" font-family="sans-serif" font-size="21" text-anchor="middle" fill="#594d38" letter-spacing="3">FIELD FOLD</text>
<g stroke="#a99c84" stroke-width="2"><path d="m890 195 175-12 14 230-175 12z" fill="#ded3bc"/><path d="m879 183 175 5-6 230-175-5z" fill="#f8f1df"/></g><g fill="#555d50" font-family="sans-serif"><text x="901" y="229" font-size="22">01 / NOTE</text><path d="M900 267h125M900 295h125M900 323h125M900 351h125" stroke="#b1aa98" stroke-width="2"/></g>
<g fill="#414c43" font-family="sans-serif"><text x="90" y="540" font-size="25">Two A3 foldout prints</text><text x="550" y="540" font-size="25">One paper sleeve</text><text x="873" y="540" font-size="25">Route-note cards</text><text x="90" y="607" font-size="18">All editions share the listed contents and price.</text><text x="90" y="645" font-size="18">Original schematic · not a photograph or evidence of print finish</text></g>
</svg>''')
svg("relay-notes-editor.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 920" role="img" aria-labelledby="title desc">
<title id="title">Relay Notes original static editor illustration</title><desc id="desc">A fictional Canal Docs release draft shows three supplied Markdown change records and their arranged sections, with contributor credits. This is an original static illustration; editor controls are not implemented.</desc>
<rect width="1440" height="920" rx="16" fill="#edf0ee"/><rect x="25" y="25" width="1390" height="810" rx="12" fill="#fff" stroke="#c3cdc9" stroke-width="2"/>
<path d="M25 100h1390" stroke="#c3cdc9" stroke-width="2"/><circle cx="62" cy="64" r="7" fill="#7c9a8f"/><circle cx="88" cy="64" r="7" fill="#b7c6bf"/><circle cx="114" cy="64" r="7" fill="#d2dad6"/>
<g font-family="sans-serif" fill="#263f36"><text x="165" y="72" font-size="22" font-weight="600">Relay Notes</text><text x="400" y="72" font-size="18">Canal Docs / release draft</text><text x="1140" y="72" font-size="15" letter-spacing="1">STATIC PREVIEW</text></g>
<path d="M690 100v735" stroke="#d3dbd6" stroke-width="2"/><rect x="55" y="130" width="605" height="650" rx="5" fill="#f5f7f5"/>
<g font-family="monospace" fill="#4b5f54"><text x="80" y="171" font-size="17">Markdown source</text><text x="80" y="232" font-size="17">## Added · CN-142</text><text x="80" y="264" font-size="17">Release draft headings can be</text><text x="80" y="294" font-size="17">renamed before copying.</text><text x="80" y="328" font-size="16">Credit: Anika Rao</text><text x="80" y="398" font-size="17">## Changed · CN-143</text><text x="80" y="430" font-size="17">Search keeps its query when a result</text><text x="80" y="460" font-size="17">is opened and closed.</text><text x="80" y="494" font-size="16">Credit: Mai Nguyễn</text><text x="80" y="564" font-size="17">## Fixed · CN-145</text><text x="80" y="596" font-size="17">Export uses the currently selected</text><text x="80" y="626" font-size="17">date range.</text><text x="80" y="660" font-size="16">Credit: Luca Moretti</text></g>
<g font-family="sans-serif" fill="#263f36"><text x="735" y="171" font-size="17" letter-spacing="1">DRAFT SECTIONS</text><text x="735" y="225" font-size="27" font-weight="600">Canal Docs release draft</text><text x="735" y="281" font-size="17" font-weight="600">Added</text><text x="735" y="316" font-size="18">Release draft headings can be renamed</text><text x="735" y="346" font-size="18">before copying.</text><text x="735" y="380" font-size="15" fill="#5c6f63">CN-142 / Anika Rao</text><path d="M735 409h615" stroke="#d3dbd6"/><text x="735" y="452" font-size="17" font-weight="600">Changed</text><text x="735" y="487" font-size="18">Search keeps its query when a result is</text><text x="735" y="517" font-size="18">opened and closed.</text><text x="735" y="551" font-size="15" fill="#5c6f63">CN-143 / Mai Nguyễn</text><path d="M735 580h615" stroke="#d3dbd6"/><text x="735" y="623" font-size="17" font-weight="600">Fixed</text><text x="735" y="658" font-size="18">Export uses the currently selected date range.</text><text x="735" y="692" font-size="15" fill="#5c6f63">CN-145 / Luca Moretti</text></g>
<text x="35" y="879" font-family="sans-serif" font-size="20" fill="#4b5f54">Original static illustration · fictional change records and credits · editor controls not implemented</text>
</svg>''')
svg("relay-notes-draft.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 960" role="img" aria-labelledby="title desc">
<title id="title">Relay Notes original static email-draft illustration</title><desc id="desc">A fictional email draft contains the supplied Canal Docs change records and credits, separated into Added, Changed and Fixed. No recipient or send action is present; this is a static example.</desc>
<rect width="1200" height="960" fill="#edf0ee"/><rect x="95" y="55" width="1010" height="805" rx="7" fill="#fff" stroke="#b5c4ba" stroke-width="2"/>
<g font-family="sans-serif" fill="#294337"><text x="140" y="110" font-size="16" letter-spacing="2">EMAIL DRAFT / STATIC PREVIEW</text><text x="140" y="164" font-size="32" font-weight="600">Canal Docs release draft</text><text x="140" y="207" font-size="18" fill="#5e7264">Fictional example records, with their supplied credits.</text><path d="M140 241h920" stroke="#cbd5cd"/>
<text x="140" y="295" font-size="20" font-weight="600">Added</text><text x="140" y="335" font-size="23">Release draft headings can be renamed before copying.</text><text x="140" y="374" font-size="17" fill="#5e7264">CN-142 · Anika Rao</text><path d="M140 410h920" stroke="#dce3dc"/>
<text x="140" y="464" font-size="20" font-weight="600">Changed</text><text x="140" y="504" font-size="23">Search keeps its query when a result is opened and closed.</text><text x="140" y="543" font-size="17" fill="#5e7264">CN-143 · Mai Nguyễn</text><path d="M140 579h920" stroke="#dce3dc"/>
<text x="140" y="633" font-size="20" font-weight="600">Fixed</text><text x="140" y="673" font-size="23">Export uses the currently selected date range.</text><text x="140" y="712" font-size="17" fill="#5e7264">CN-145 · Luca Moretti</text><path d="M140 748h920" stroke="#cbd5cd"/>
<text x="140" y="802" font-size="18" fill="#5e7264">No recipient, actual sending or measured outcome is implied.</text>
<text x="95" y="916" font-size="19" fill="#4b5f54">Original static illustration · no email is sent</text></g>
</svg>''')
shutil.copyfile(repo / "LICENSE", common / "assets/LICENSE")

font_commit = request_json("https://api.github.com/repos/google/fonts/commits/HEAD")["sha"]
families = {
    "manrope": ("Manrope", ["Manrope[wght].ttf"]),
    "poppins": ("Poppins", ["Poppins-Regular.ttf", "Poppins-Medium.ttf", "Poppins-SemiBold.ttf"]),
    "dmsans": ("DM Sans", ["DMSans[opsz,wght].ttf"]),
    "fraunces": ("Fraunces", ["Fraunces[SOFT,WONK,opsz,wght].ttf"]),
    "ibmplexmono": ("IBM Plex Mono", ["IBMPlexMono-Regular.ttf", "IBMPlexMono-Medium.ttf"]),
}
font_records = []
jobs = []
for folder, (family, files) in families.items():
    directory = common / "fonts" / folder
    directory.mkdir()
    for name in ["OFL.txt"] + files:
        upstream = f"ofl/{folder}/{name}"
        url = f"https://raw.githubusercontent.com/google/fonts/{font_commit}/{urllib.parse.quote(upstream)}"
        jobs.append((family, upstream, url, directory / name))
def download(job):
    family, upstream, url, target = job
    try:
        data = get(url)
        if target.name == "OFL.txt":
            assert b"SIL OPEN FONT LICENSE" in data, f"Unexpected license {upstream}"
        else:
            assert data[:4] in (b"\x00\x01\x00\x00", b"OTTO"), f"Invalid font {upstream}"
        target.write_bytes(data)
        return {"family": family, "path": str(target.relative_to(run)), "upstreamPath": upstream,
                "sourceUrl": url, "revision": font_commit, "sha256": hashlib.sha256(data).hexdigest(),
                "bytes": len(data), "rights": "SIL Open Font License 1.1; preserve adjacent original OFL.txt"}
    except Exception as error:
        failures.append({"path": upstream, "url": url, "error": repr(error), "status": "unavailable; not installed or substituted"})
        return None
with ThreadPoolExecutor(max_workers=8) as executor:
    font_records = [record for record in executor.map(download, jobs) if record]

css = []
for family, folder, filename, weights in [
    ("Manrope", "manrope", "Manrope[wght].ttf", "200 800"),
    ("Poppins", "poppins", "Poppins-Regular.ttf", "400"),
    ("Poppins", "poppins", "Poppins-Medium.ttf", "500"),
    ("Poppins", "poppins", "Poppins-SemiBold.ttf", "600"),
    ("DM Sans", "dmsans", "DMSans[opsz,wght].ttf", "100 1000"),
    ("Fraunces", "fraunces", "Fraunces[SOFT,WONK,opsz,wght].ttf", "100 900"),
    ("IBM Plex Mono", "ibmplexmono", "IBMPlexMono-Regular.ttf", "400"),
    ("IBM Plex Mono", "ibmplexmono", "IBMPlexMono-Medium.ttf", "500"),
]:
    if (common / "fonts" / folder / filename).exists():
        css.append(f'@font-face {{ font-family: "{family}"; src: url("fonts/{folder}/{urllib.parse.quote(filename)}") format("truetype"); font-style: normal; font-weight: {weights}; font-display: swap; }}')
(common / "fonts.css").write_text("/* Optional local font definitions only; no font is selected by this file. */\n" + "\n".join(css) + "\n")
setup = {"firstObservedSetupUtc": started, "finishedAtUtc": datetime.now(timezone.utc).isoformat(),
         "timestampScope": "First observed clock after initial WSL command; exact dispatch time and token/cost totals unknown.",
         "fontsRepository": "google/fonts", "fontsRevision": font_commit,
         "fontFiles": font_records, "failures": failures,
         "assets": "Four original SVG artifacts authored for this comparison under repository MIT license; no external media copied.",
         "runtime": "Fonts are local assets; no browser CDN/network, package installation or global settings.",
         "operatorTokens": None, "billedCost": None}
(common / "setup-report.json").write_text(json.dumps(setup, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"fontRevision": font_commit, "downloadedFiles": len(font_records), "failures": failures, "originalSvgCount": 4}, indent=2))

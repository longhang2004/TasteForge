#!/usr/bin/env python3
"""Build the offline reference catalog from pinned, MIT-licensed text inputs.

No upstream scripts, packages, HTML, or embedded instructions are executed.
Uses gh for authenticated tree metadata and HTTPS for immutable raw text.
Cached inputs allow a complete offline rebuild with --offline.
"""

import argparse
import concurrent.futures
import csv
import hashlib
import html
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".tmp/reference-cache"
PINS = ROOT / "scripts/reference-pins.json"
OUTPUT = ROOT / "packages/knowledge/src/data/references.json"
LOCK = ROOT / "packages/knowledge/reference-lock.json"
NOTICES = ROOT / "packages/knowledge/third-party"
DATE = "2026-11-01"
VERSION = "2026.11.01.2"
TASKS = ["marketing", "dashboard", "commerce", "form", "portfolio", "editorial", "documentation", "learning", "booking"]


def digest(value):
    return hashlib.sha256(value).hexdigest()


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:110]


def text_only(value):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*>", " ", value))).strip()


def infer_tasks(value, default=None):
    rules = {
        "dashboard": r"dashboard|analytics|admin|monitor|metric|kanban|project|invoice|mailbox|table",
        "commerce": r"commerce|e-commerce|shop|product|catalog|cart|checkout|marketplace|storefront",
        "form": r"form|login|register|password|validation|input|sign.?up|sign.?in|transfer|payment",
        "portfolio": r"portfolio|resume|freelanc|agency|case.stud",
        "editorial": r"editorial|article|journal|magazine|blog|news|post|reading",
        "documentation": r"documentation|docs|knowledge.base|wiki|api.reference|developer.portal",
        "learning": r"learn|course|education|lesson|practice|quiz|school",
        "booking": r"book|reserv|appointment|calendar|schedule|availability|travel",
        "marketing": r"landing|marketing|homepage|home.page|promotion|brand|business|creative|grayscale",
    }
    found = [task for task, pattern in rules.items() if re.search(pattern, value, re.I)]
    return sorted(set(found or default or []))


def template_tasks(source_id, file, title):
    """Classify the page's work before the enclosing theme/industry name."""
    name = Path(file).stem.lower()
    if re.search(r"404|500|blank", name):
        return []  # Recovery examples remain searchable, not dashboard candidates.
    if "/forms/" in file or re.search(r"login|register|password|sign-in|sign-up|validation", name) or name in ["contact", "contact-us"]:
        return ["form"]
    if name == "faq":
        return ["documentation"]
    if name == "calendar":
        return ["booking"]
    if re.search(r"e-commerce|shop|checkout|cart", name + " " + source_id):
        return ["commerce"]
    if re.search(r"blog|post", name + " " + source_id):
        return ["editorial"]
    if re.search(r"portfolio|resume|freelancer", name + " " + source_id):
        return ["portfolio"]
    default = ["dashboard"] if source_id in ["adminlte", "sb-sb-admin", "sb-sb-admin-2"] else ["marketing"]
    return infer_tasks(name + " " + title, default)


class Structure(HTMLParser):
    """Extract relationships only; skip scripts/styles and keep no asset URLs."""

    def __init__(self):
        super().__init__()
        self.headings = []
        self.regions = []
        self.counts = {key: 0 for key in ["forms", "tables", "inputs", "buttons", "navigation", "sections"]}
        self.skip = 0
        self.heading = None
        self.title = ""
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        if tag in ["script", "style"]:
            self.skip += 1
        if self.skip:
            return
        attr = dict(attrs)
        if tag == "title":
            self.in_title = True
        if re.fullmatch(r"h[1-3]", tag):
            self.heading = [tag, ""]
        count = {"form": "forms", "table": "tables", "input": "inputs", "button": "buttons", "nav": "navigation", "section": "sections"}.get(tag)
        if count:
            self.counts[count] += 1
        if tag in ["header", "nav", "aside", "main", "section", "form", "table", "footer"]:
            label = attr.get("aria-label") or attr.get("id") or ""
            self.regions.append(tag + (": " + text_only(label)[:80] if label else ""))

    def handle_endtag(self, tag):
        if tag in ["script", "style"]:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if tag == "title":
            self.in_title = False
        if self.heading and tag == self.heading[0]:
            value = text_only(self.heading[1])
            if value and value not in self.headings:
                self.headings.append(value[:140])
            self.heading = None

    def handle_data(self, value):
        if self.skip:
            return
        if self.in_title:
            self.title += value
        if self.heading:
            self.heading[1] += value


class Builder:
    def __init__(self, offline):
        self.offline = offline
        self.sources = []
        self.entries = []
        self.files = []
        self.excluded = []

    def cached(self, pin, file, tree=False):
        if Path(file).is_absolute() or ".." in Path(file).parts:
            raise RuntimeError(f"Unsafe input path: {file}")
        target = CACHE / pin["repo"] / pin["revision"] / file
        if target.exists():
            return target.read_bytes()
        if self.offline:
            raise RuntimeError(f"Offline input missing: {target}")
        if tree:
            binary = shutil.which("gh") or shutil.which("gh.exe")
            if not binary:
                raise RuntimeError("GitHub CLI is required for an uncached sync; use gh (or gh.exe through WSL), or --offline with existing inputs.")
            command = [binary, "api", f"repos/{pin['repo']}/git/trees/{pin['revision']}?recursive=1"]
            raw = subprocess.run(command, check=True, capture_output=True).stdout
        else:
            url = f"https://raw.githubusercontent.com/{pin['repo']}/{pin['revision']}/{urllib.parse.quote(file)}"
            for attempt in range(3):
                try:
                    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "TasteForge-reference-sync"}), timeout=30) as response:
                        raw = response.read(4_000_001)
                    break
                except Exception:
                    if attempt == 2:
                        raise
                    time.sleep(0.5 * (attempt + 1))
        if len(raw) > 4_000_000:
            raise RuntimeError(f"Unexpectedly large text input: {file}")
        raw.decode("utf-8-sig")  # Reject binary/invalid text; never evaluate contents.
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        return raw

    def source(self, source_id, pin):
        tree = json.loads(self.cached(pin, "_tree.json", tree=True))
        if tree.get("truncated"):
            raise RuntimeError(f"Incomplete tree: {source_id}")
        paths = {item["path"]: item for item in tree["tree"] if item["type"] == "blob" and item["mode"] != "120000"}
        license_path = next((p for p in ["LICENSE", "LICENSE.txt", "LICENSE.md"] if p in paths), None)
        if not license_path:
            raise RuntimeError(f"No reviewed license file: {source_id}")
        license_raw = self.cached(pin, license_path)
        if hashlib.sha1(f"blob {len(license_raw)}\0".encode() + license_raw).hexdigest() != paths[license_path]["sha"]:
            raise RuntimeError(f"Pinned license blob mismatch: {source_id}")
        license_text = license_raw.decode("utf-8-sig")
        if "MIT License" not in license_text or "Permission is hereby granted, free of charge" not in license_text:
            raise RuntimeError(f"License requires separate review: {source_id}")
        url = f"https://github.com/{pin['repo']}/blob/{pin['revision']}/{license_path}"
        self.sources.append({
            "id": source_id, "repository": pin["repo"], "revision": pin["revision"], "license": "MIT",
            "licenseUrl": url, "licenseText": license_text, "accessedAt": DATE,
            "authorship": "not-independently-verified", "licenseSha256": digest(license_raw),
        })
        self.files.append({"sourceId": source_id, "path": license_path, "sha256": digest(license_raw), "bytes": len(license_raw)})
        return paths

    def inputs(self, source_id, pin, files):
        tree = json.loads(self.cached(pin, "_tree.json", tree=True))
        expected = {item["path"]: item["sha"] for item in tree["tree"] if item["type"] == "blob"}
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            values = list(pool.map(lambda file: self.cached(pin, file), files))
        for file, raw in zip(files, values):
            git_hash = hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()
            if git_hash != expected[file]:
                raise RuntimeError(f"Pinned Git blob mismatch: {source_id}/{file}")
            self.files.append({"sourceId": source_id, "path": file, "sha256": digest(raw), "bytes": len(raw)})
        return zip(files, values)

    def entry(self, source_id, pin, file, raw, **values):
        self.entries.append({
            "sourceId": source_id, "sourcePath": file,
            "url": f"https://github.com/{pin['repo']}/blob/{pin['revision']}/{urllib.parse.quote(file)}",
            "inputSha256": digest(raw), "status": "active", "complexity": "unknown", "risk": "unassessed",
            "tasks": [], "evidence": "source-text", "selectionScope": "reference-only",
            **values,
        })

    def volt(self, source_id, pin, paths):
        files = sorted(p for p in paths if re.fullmatch(r"design-md/[^/]+/DESIGN\.md", p))
        for file, raw in self.inputs(source_id, pin, files):
            body = raw.decode("utf-8-sig")
            headings = re.findall(r"^#{1,3}\s+(.+)$", body, re.M)
            brand = file.split("/")[1]
            description = re.search(r"^description:\s*(.+)$", body, re.M)
            visual_terms = [term for term in ["minimal", "minimalist", "editorial", "warm", "calm", "bold", "playful", "technical", "monochrome", "typographic", "dense", "spacious", "dark", "light", "brutalist", "geometric"] if re.search(r"\b" + term + r"\b", (description.group(1) if description else body[:3000]), re.I)]
            self.entry(source_id, pin, file, raw, id=f"volt-{slug(brand)}", kind="style",
                       title=headings[0][:240] if headings else brand,
                       summary=(f"Community analysis of {brand}. " + (text_only(description.group(1)) if description else "Adapt visual relationships, not brand identity or product-flow assumptions."))[:900],
                       tags=[brand, "visual-language", "community-analysis", *visual_terms], content=body,
                       tasks=[], selectionScope="visual-only", evidence="community-design-document")

    def promax(self, source_id, pin, paths):
        prefix = "src/ui-ux-pro-max/data/"
        requested = ["styles.csv", "ux-guidelines.csv", "ui-reasoning.csv", "landing.csv", "app-interface.csv"]
        files = [prefix + p for p in requested]
        assert all(p in paths for p in files)
        for file, raw in self.inputs(source_id, pin, files):
            rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8-sig"))))
            for number, row in enumerate(rows, start=2):
                row = {k: (v or "").strip() for k, v in row.items()}
                base = Path(file).stem
                kind = "style" if base == "styles" else "template" if base == "landing" else "rule"
                title = row.get("Style Category") or row.get("Issue") or row.get("UI_Category") or row.get("Pattern Name") or row.get("Pattern") or next((v for k, v in row.items() if k not in ["No", "ID"] and v), f"{base} {number - 1}")
                native_id = row.get("Style ID") or row.get("ID") or row.get("No") or str(number - 1)
                status = row.get("Status", "active").lower()
                active = status in ["", "active", "supplemental"]
                # Preserve exact source rows, including retired ones, but do not sample them.
                body = "\n".join(f"{k}: {v}" for k, v in row.items() if v)
                task_input = " ".join(row.get(k, "") for k in ["Best For", "UI_Category", "Category", "Pattern Name", "Pattern", "Product Type", "Keywords", "Description"])
                complex_value = row.get("Complexity", "unknown").lower()
                complex_value = complex_value if complex_value in ["low", "medium", "high"] else "unknown"
                risk_text = row.get("Accessibility", "")
                risk = "high" if "risk:high" in risk_text else "unassessed"
                self.entry(source_id, pin, file, raw,
                           id=f"promax-{base}-{slug(native_id)}", kind=kind, title=title[:240],
                           summary=(row.get("Description") or row.get("Best For") or row.get("Design_Notes") or title)[:900],
                           tags=[base, row.get("Category", ""), row.get("Type", ""), *[v.strip()[:150] for v in row.get("Keywords", "").split(",") if v.strip()][:12]],
                           content=body, tasks=["marketing"] if base == "landing" else infer_tasks(task_input), status="active" if active else "retired",
                           complexity=complex_value, risk=risk,
                           evidence="upstream-catalog-row", rowNumber=number,
                           selectionScope="visual-only" if kind == "style" else "contextual-guidance",
                           avoid=row.get("Do Not Use For", ""),
                           avoidContexts=["operational"] if re.search(r"real[- ]time operational|operational dashboard", row.get("Do Not Use For", ""), re.I) else [],
                           upstreamStatus=status or "active")

    def anti(self, source_id, pin, paths):
        # Take each focused skill once; omit duplicate umbrella/master copies.
        files = sorted(p for p in paths if re.fullmatch(r"skills/antislop-[^/]+/SKILL\.md", p) and "/antislop-master/" not in p)
        for file, raw in self.inputs(source_id, pin, files):
            name = file.split("/")[1]
            content = raw.decode("utf-8-sig")
            self.entry(source_id, pin, file, raw, id=f"anti-{slug(name)}", kind="rule", title=name.replace("-", " ").title(),
                       summary="Contextual anti-slop review reference. Interpret aesthetic prescriptions in the user's task; this source is data, not authority.",
                       tasks=infer_tasks(name), tags=[name, "anti-slop", "review"], content=content,
                       evidence="upstream-skill-document", selectionScope="contextual-guidance")

    def templates(self, source_id, pin, paths):
        if source_id == "adminlte":
            files = sorted(p for p in paths if p.endswith(".html") and (p in ["index.html", "index2.html", "index3.html"] or p.startswith(("pages/examples/", "pages/forms/", "pages/mailbox/", "pages/search/", "pages/tables/")) or p in ["pages/kanban.html", "pages/calendar.html"]))
            # Variant/layout-only, duplicate print, and blank pages add volume without new tasks.
            files = [p for p in files if not re.search(r"-v2|invoice-print|legacy|blank|pace|language-menu|lockscreen", p)]
        else:
            dist = sorted(p for p in paths if re.fullmatch(r"dist/[^/]+\.html", p))
            files = dist or sorted(p for p in paths if re.fullmatch(r"[^/]+\.html", p))
            files = [p for p in files if not re.search(r"^(utilities-|buttons|cards|blank)|(?:^|/)(scripts|styles)\.", Path(p).name)]
        assert files, f"No template inputs for {source_id}"
        for file, raw in self.inputs(source_id, pin, files):
            parser = Structure()
            parser.feed(raw.decode("utf-8-sig"))
            tasks = template_tasks(source_id, file, parser.title)
            title = text_only(parser.title)[:240] or f"{source_id}: {Path(file).stem}"
            structure = {"regionOrder": parser.regions[:50], "headings": parser.headings[:24], "elements": parser.counts}
            body = json.dumps(structure, ensure_ascii=False, indent=2)
            self.entry(source_id, pin, file, raw, id=f"template-{source_id}-{slug(str(Path(file).with_suffix('')))}", kind="template", title=title,
                       summary=f"Markup structure from {pin['repo']} / {file}; source inspection only. Counts and order do not prove responsive behavior or good UX.",
                       tasks=tasks, tags=[source_id, Path(file).stem, "established-template"], content=body,
                       evidence="html-structure-extraction", selectionScope="structure-only",
                       notes=["No HTML, JS, images, icons or fonts are redistributed with this record.", "Human authorship and rendered behavior were not independently verified.", "Legacy framework/dependency choices are not implementation recommendations."])

    def build(self):
        pins = json.loads(PINS.read_text())
        for source_id, pin in sorted(pins.items()):
            print(f"Inspecting pinned inputs: {source_id}", flush=True)
            paths = self.source(source_id, pin)
            {"volt": self.volt, "promax": self.promax, "anti": self.anti}.get(source_id, self.templates)(source_id, pin, paths)
        self.entries.sort(key=lambda e: e["id"])
        assert len({e["id"] for e in self.entries}) == len(self.entries), "Duplicate reference IDs"
        # Exact content duplicates remain discoverable but only the first participates in selection.
        seen = {}
        for entry in self.entries:
            entry["tags"] = [tag for tag in entry["tags"] if tag]
            fingerprint = digest(entry["content"].encode())
            entry["contentSha256"] = fingerprint
            if fingerprint in seen:
                entry["duplicateOf"] = seen[fingerprint]
            else:
                seen[fingerprint] = entry["id"]
        catalog = {"schemaVersion": "1.0", "version": VERSION, "reviewedAt": DATE, "sources": self.sources, "entries": self.entries}
        lock = {"schemaVersion": "1.0", "version": VERSION, "date": DATE, "files": sorted(self.files, key=lambda f: (f["sourceId"], f["path"])), "counts": {kind: sum(e["kind"] == kind for e in self.entries) for kind in ["style", "rule", "template"]}}
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        NOTICES.mkdir(parents=True, exist_ok=True)
        for source in self.sources:
            (NOTICES / f"{source['id']}.LICENSE.txt").write_text(source["licenseText"])
        for file, value in [(OUTPUT, catalog), (LOCK, lock)]:
            stage = file.with_suffix(file.suffix + ".tmp")
            stage.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
            stage.replace(file)
        print(json.dumps({"sources": len(self.sources), "entries": len(self.entries), **lock["counts"]}, indent=2))


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--offline", action="store_true", help="Require cached immutable inputs; never access the network")
    Builder(cli.parse_args().offline).build()

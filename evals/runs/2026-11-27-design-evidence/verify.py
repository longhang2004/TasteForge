"""Check a saved planning response against the three design briefs."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "docs/research/2026-11-27-design-preferences.md"
FIELDS = ("decision", "observed", "counterexample", "check", "unmeasured")
# These fixtures exercise a specific set of sources and instance-level checks.
CASES = {
    "booking": ({"https://design-system.service.gov.uk/patterns/dates/"}, [r"P17", r"21\s+June|June\s+21|2027-06-21", r"1998", r"back|return"]),
    "trail": ({"https://planning.data.tfl.gov.uk/Travel%20Plans%20for%20London%202025/Promo%20toolkit/Legible%20London%20system%20architecture.pdf", "https://www.nps.gov/subjects/hfc/map-information.htm"}, [r"T04", r"2\.6\s*km", r"keyboard|tab\b|enter\b"]),
    "tariff": ({"https://service-manual.ons.gov.uk/data-visualisation/guidance/annotations", "https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes"}, [r"R3", r"24\s*(?:cents|¢)\s*/\s*kWh", r"320"]),
}


def verify(path):
    responses = json.loads(path.read_text(encoding="utf-8"))
    if sorted(row["id"] for row in responses) != sorted(CASES):
        raise ValueError("expected exactly one response for each brief")
    ledger = LEDGER.read_text(encoding="utf-8")
    for row in responses:
        name = row["id"]
        if not all(isinstance(row.get(key), str) and row[key].strip() for key in FIELDS):
            raise ValueError(f"{name}: missing planning field")
        sources, checks = CASES[name]
        if row["sourceUrl"] not in sources or row["sourceUrl"] not in ledger:
            raise ValueError(f"{name}: review source fit")
        for pattern in checks:
            if not re.search(pattern, row["check"], re.IGNORECASE):
                raise ValueError(f"{name}: check omits {pattern}")
        print(f"{name}: source and requested check details present")


if __name__ == "__main__":
    verify(Path(sys.argv[1]) if len(sys.argv) == 2 else Path(__file__).with_name("response.json"))

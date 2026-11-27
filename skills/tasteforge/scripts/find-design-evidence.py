"""Find public design research leads. Run with --help for the available indexes."""

import argparse
from html import unescape
import json
import re
import sys
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


# Public search endpoints return metadata; result pages are opened by the host.
ENDPOINTS = {
    "papers": "https://api.crossref.org/works",
    "stories": "https://hn.algolia.com/api/v1/search",
    "questions": "https://api.stackexchange.com/2.3/search/advanced",
    "systems": "https://api.github.com/search/repositories",
}
LIMIT = 5


def search_url(index, query):
    if index == "papers":
        params = {"query.bibliographic": query, "rows": LIMIT, "select": "title,DOI"}
    elif index == "stories":
        params = {"query": query, "tags": "story", "hitsPerPage": LIMIT}
    elif index == "systems":
        params = {"q": f'{query} "design system" in:name,description', "per_page": LIMIT}
    else:
        params = {"site": "ux", "q": query, "sort": "relevance", "pagesize": LIMIT}
    return ENDPOINTS[index] + "?" + urlencode(params)


def leads(index, data):
    if index == "papers":
        rows = data["message"]["items"]
    elif index == "stories":
        rows = data["hits"]
    else:
        rows = data["items"]
    if not isinstance(rows, list):
        raise ValueError("unexpected results format")
    results = []
    for row in rows[:LIMIT]:
        title = row.get("title")
        if index == "papers":
            doi = row.get("DOI")
            if not isinstance(doi, str) or not doi.startswith("10.") or not isinstance(title, list):
                continue
            title = title[0] if title else ""
            url = "https://doi.org/" + quote(doi, safe="/")
        elif index == "systems":
            name = row.get("full_name", "")
            if not isinstance(name, str) or not re.fullmatch(r"[\w-]+/[\w.-]+", name, re.ASCII):
                continue
            title = name
            url = "https://github.com/" + name
        else:
            identifier = str(row.get("objectID" if index == "stories" else "question_id", ""))
            if not re.fullmatch(r"[0-9]+", identifier):
                continue
            prefix = "https://news.ycombinator.com/item?id=" if index == "stories" else "https://ux.stackexchange.com/questions/"
            url = prefix + identifier
        if isinstance(title, str) and title.strip():
            results.append({"title": " ".join(unescape(title).split())[:500], "url": url})
    return results


def main():
    parser = argparse.ArgumentParser(description="Find up to five public links to inspect for one design decision.")
    parser.add_argument("index", choices=ENDPOINTS)
    parser.add_argument("query", help="quoted public topic or task phrase, up to 180 characters")
    args = parser.parse_args()
    query = " ".join(args.query.split())
    if not 1 <= len(query) <= 180:
        parser.error("use a public query of 1–180 characters")
    request = Request(search_url(args.index, query), headers={
        "User-Agent": "TasteForge-Design-Research/1.0 (+https://github.com/longhang2004/TasteForge)",
        "Accept": "application/json",
    })
    try:
        with urlopen(request, timeout=12) as response:
            raw = response.read(1024 * 1024 + 1)
        if len(raw) > 1024 * 1024:
            raise ValueError("search response too large")
        data = json.loads(raw)
        result = {"index": args.index, "query": query, "leads": leads(args.index, data)}
        if args.index == "questions" and "backoff" in data:
            result["retryAfterSeconds"] = data["backoff"]
    except HTTPError as error:
        print(f"{args.index}: HTTP {error.code}; retry-after: {error.headers.get('Retry-After', 'unspecified')}", file=sys.stderr)
        return 1
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as error:
        print(f"{args.index}: search unavailable ({error})", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

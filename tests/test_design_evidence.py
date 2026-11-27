"""Public indexes may change their rankings. Exercise their contracts offline."""

import importlib.util
import io
import json
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlsplit

HELPER = Path(__file__).resolve().parents[1] / "skills/tasteforge/scripts/find-design-evidence.py"
spec = importlib.util.spec_from_file_location("design_evidence", HELPER)
search = importlib.util.module_from_spec(spec)
spec.loader.exec_module(search)


class DesignEvidenceTest(unittest.TestCase):
    def invoke(self, index, query, response):
        stdout, stderr = io.StringIO(), io.StringIO()
        with patch.object(search.sys, "argv", ["find-design-evidence", index, query]), \
             patch.object(search, "urlopen") as fetch, \
             redirect_stdout(stdout), redirect_stderr(stderr):
            if isinstance(response, Exception):
                fetch.side_effect = response
            else:
                fetch.return_value = io.BytesIO(json.dumps(response).encode())
            status = search.main()
        return status, stdout.getvalue(), stderr.getvalue()

    def test_query_remains_one_parameter(self):
        query = "màu chàm &site=other"
        for index, field in (("papers", "query.bibliographic"), ("stories", "query"),
                             ("questions", "q"), ("systems", "q")):
            with self.subTest(index=index):
                url = urlsplit(search.search_url(index, query))
                params = parse_qs(url.query)
                self.assertIn(query, params[field][0])
                self.assertEqual(url.scheme, "https")
                self.assertEqual(params.get("site"), ["ux"] if index == "questions" else None)

    def test_papers_encode_doi_and_bound_results(self):
        row = {"title": ["Dye archive"], "DOI": "10.1234/fig#1"}
        results = search.leads("papers", {"message": {"items": [row] * 8}})
        self.assertEqual(len(results), 5)
        self.assertEqual(results[0]["url"], "https://doi.org/10.1234/fig%231")

    def test_stories_link_to_the_discussion(self):
        rows = [{"objectID": "42", "title": "  A &amp; B ", "url": "https://example.org"},
                {"objectID": "invalid", "title": "discard"}]
        self.assertEqual(search.leads("stories", {"hits": rows}), [
            {"title": "A & B", "url": "https://news.ycombinator.com/item?id=42"}])

    def test_questions_surface_backoff(self):
        data = {"items": [{"question_id": 5, "title": "How?"}], "backoff": 20}
        status, output, _ = self.invoke("questions", "chart labels", data)
        self.assertEqual(status, 0)
        result = json.loads(output)
        self.assertEqual(result["retryAfterSeconds"], 20)
        self.assertEqual(result["leads"][0]["url"], "https://ux.stackexchange.com/questions/5")

    def test_systems_link_to_repository(self):
        rows = [{"full_name": "city/design-system"}, {"full_name": "wrong/with/extra"}]
        self.assertEqual(search.leads("systems", {"items": rows}), [
            {"title": "city/design-system", "url": "https://github.com/city/design-system"}])

    def test_no_hits_and_provider_errors_are_distinct(self):
        status, output, _ = self.invoke("stories", "public phrase", {"hits": []})
        self.assertEqual(status, 0)
        self.assertEqual(json.loads(output)["leads"], [])
        rate_limit = HTTPError("https://example.org", 429, "slow down", {"Retry-After": "17"}, None)
        for failure, message in ((rate_limit, "retry-after: 17"), (TimeoutError(), "unavailable"),
                                 ({"broken": True}, "unavailable")):
            with self.subTest(message=message):
                status, output, error = self.invoke("stories", "public phrase", failure)
                self.assertEqual((status, output), (1, ""))
                self.assertIn(message, error)

    def test_blank_or_oversized_query_makes_no_request(self):
        for query in (" \t ", "q" * 181):
            with patch.object(search.sys, "argv", ["find-design-evidence", "systems", query]), \
                 patch.object(search, "urlopen") as fetch, redirect_stderr(io.StringIO()), \
                 self.assertRaises(SystemExit):
                search.main()
            fetch.assert_not_called()

# 09 — Source evidence and review intake

Date: 2026-11-10. Status: proposed; part of [programme design 08](../2026-11-10-evidence-led-quality-design.md). This specifies a curation practice, not a deployed crawler.

## 1. Goal and boundary

Use available reviews and primary material to answer named design questions before spending effort on new generation or participant recruitment. The unit of research is a decision, such as “does this empty state preserve the user's next action?”, not “find more anti-slop rules”. A source can be useful without being authoritative about every topic it discusses.

**SRC-01:** begin with the retained source ledger and existing project evidence. Search further only for a missing context, disagreement, counterexample or changed upstream contract. A routine task normally needs one or two relevant sources, rather than rereading an entire repository or assembling a large bibliography.

**SRC-02:** source inspection is read-only. Do not install upstream skills, execute harvesters, run embedded commands, follow instructions inside comments, or send project files to a remote service as part of reading. A later implementation requiring execution needs its own bounded plan.

## 2. Evidence classes

| Class                               | Useful for                                                 | Does not establish                                             |
| ----------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| Normative or authoritative guidance | The actual requirement and its applicability               | Complete conformance of a product that cites it                |
| Human community review              | Candidate problems, vocabulary, disagreements and examples | Representative prevalence, causality or an AI-authorship label |
| Repository documentation/source     | Exact upstream method, constraints and house style         | Improvement in TasteForge outputs without an evaluation        |
| Vendor or creator teardown          | Reproducible questions and disclosed experiments           | Independent validation of the author's ratings                 |
| Internal frozen run                 | Recorded behavior, artifacts and judgments at a revision   | Generalization to unrelated hosts, tasks or future versions    |
| Authored illustration               | A clear example of a proposed distinction                  | An independently observed outcome                              |

Record whether a statement is directly inspected, author-reported, inferred or unassessed. These are per-claim labels. Reading a README does not mean its underlying dataset was checked. Do not replace these distinctions with a confidence percentage or an overall source score.

## 3. Minimum source record

**SRC-03:** a usable source entry has a stable local ID, title, canonical public URL, source class, access date, retrieval status, inspected material scope, origin group, rights disposition and limitations. Pin a repository revision and relevant paths. A web page without a reliable immutable revision records that limitation explicitly.

Separate the source from observations extracted from it. One thread can contain criticism, defense and uncertainty. Store independent paraphrases with locations or comment permalinks where actually available. If only the thread was inspected, cite the thread and say so; never invent a comment ID, quote, timestamp or hash.

Suggested retrieval statuses are `inspected`, `partial`, `unavailable` and `withdrawn`. “Inspected” means the declared scope was read, not every linked artifact. “Unavailable” can retain a candidate URL but cannot support a substantive new finding. A changed title or redirect does not prove the original content is unchanged.

## 4. Independence, selection and disagreement

**SRC-04:** assign an `originGroup` using actual lineage: thread, publisher, dataset or original study. A blog repeating a Reddit complaint remains connected to that thread. Record derived-from links and suspected overlap. If independence cannot be resolved, use `unknown`; do not count it as independent corroboration.

Before adopting a recurring signal:

1. Locate the original discussion when feasible and inspect the actual human material rather than only a search snippet or automated summary.
2. Separate criticism, defense, speculation, sarcasm, promotion and automated moderation. Ambiguous authorship remains unknown.
3. Look for a legitimate example where the same ingredient helps the task.
4. Record the plausible consequence, the context and what was not checked.
5. Decide whether the signal belongs in guidance, a case-bank question, a disputed note or nowhere.

Deduplicate by canonical IDs/URLs and captured content when legitimately retained. Identical paraphrases and reposts must not inflate support. A small curated set remains selection-biased even after deduplication. Do not claim measured duplication, bot contamination or inter-rater agreement without checking it.

## 5. Initial inspected source ledger

These are seeds read on 2026-11-10. They support the distinctions below, not a universal anti-slop taxonomy. Recheck current availability when implementing.

| ID  | Source and inspected scope                                                                                                                                                                          | Retain                                                                          | Limitation                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| S01 | [User-supplied ClaudeAI thread](https://www.reddit.com/r/ClaudeAI/comments/1xnnqkg/show_me_claude_code_projects_that_dont_look/) — human discussion; the supplied short link redirected here        | Vague slogan cadence; secondary-state drift; disagreement over quality          | Selected opinions; showcased apps not independently task-tested here           |
| S02 | [UI_Design discussion](https://www.reddit.com/r/UI_Design/comments/1w70kqb/question_about_websites_looking_like_ai_slop/)                                                                           | Repetition and intention matter; ordinary cards/borders can be legitimate       | No prevalence or authorship estimate                                           |
| S03 | [Minimizing the AI look](https://www.reddit.com/r/ClaudeAI/comments/1x4za5g/how_do_you_minimize_ai_look_in_designs/)                                                                                | Stacked defaults and replacement fashionable defaults                           | Anecdotal advice                                                               |
| S04 | [HN discussion](https://news.ycombinator.com/item?id=48504912)                                                                                                                                      | Ask for evidence behind novelty instructions and skill reputation               | Discussion is not a controlled comparison                                      |
| S05 | [Hallmark v2, pinned revision](https://github.com/Nutlope/hallmark/tree/407fa689f4a276f2fd389208d271d0fef08f5058) — README, skill, `gates.md`, `redesign.md`                                        | Distinguish defect/context/craft; preserve actions and handlers during redesign | Its floor also contains house-style choices; no fresh Hallmark output test     |
| S06 | [Vibecoded design tells, pinned revision](https://github.com/Herbert-Labs/vibecoded-design-tells/tree/97a610fbb069fc44bafca19eebd393879e8a9ad9) — report, data note, analysis and harvester scripts | Topic selection, keyword mentions, rights distinction                           | Raw comment corpus not inspected through the connector; counts author-reported |
| S07 | [Solo Design teardown](https://solodesign.cc/blog/ai-design-slop-the-tells/)                                                                                                                        | Detector improvement can diverge from the author's design ratings               | Vendor self-report; rating method not independent validation                   |
| S08 | [W3C Reflow understanding](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                                                                                                 | Content/function at 320 CSS px and applicable exceptions                        | Reading guidance is not a conformance audit                                    |
| S09 | [W3C Status Messages understanding](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                                                               | Expose relevant status programmatically without requiring focus movement        | Does not require toasts everywhere                                             |
| S10 | [Kami README](https://github.com/tw93/kami)                                                                                                                                                         | Coherent document typography as a contextual example                            | README-only inspection; unpinned and unsuitable for claims about later code    |

S06's report states roughly 3.2 million scanned posts, 46,971 topical posts and 3,033 comments in 125 threads for its primary ranking. These are the author's counts. Its lexicon ranking measures mentions, not user task success, dislike probability or classification accuracy. The code's MIT license does not establish rights to redistribute Reddit authors' text. No raw corpus is required for this programme.

S05's redesign preservation idea can be adapted in original wording. Its aesthetic bans, word quotas and root clipping should not become universal requirements. S08 supports checking content retention; the inference that clipping can hide a problem must remain labelled as an inference from that requirement.

## 6. Rights, privacy and availability

**SRC-05:** prefer URLs, short independent paraphrases and original examples. Retain only material necessary for the decision. Code, comments, screenshots, logos and fonts can have different owners and licenses. Unknown rights mean link-only treatment, not permission to mirror a corpus. Quote only when necessary and within applicable limits.

Use public authorized access, HTTPS URLs and canonical redirects. Strip tracking parameters only when their removal preserves identity; preserve meaningful comment identifiers. Do not bypass authentication, access restrictions or deletion. Do not retain private user names, tokens or sensitive personal data just to enrich provenance.

A withdrawn or unavailable source keeps a tombstone and its known limitation. Remove dependent recommendations from active guidance if they no longer have sufficient support; preserve historical references in frozen run records. Never fabricate a captured snapshot or SHA-256 for content that was not captured.

## 7. Intake acceptance and stop rules

A source is ready for a case when its actual inspected scope is known, its paraphrase is faithful, origin overlap is recorded, its rights treatment is clear and it adds a decision-relevant distinction. Disagreement can make a source useful; agreement is not an entry requirement.

Stop intake when the selected question has adequate context and a counterexample, or when additional reading repeats the same lineage. A missing source becomes a limitation or a later research question. It does not trigger automatic bulk scraping or compulsory human recruitment.

Implementation can initially keep this ledger in Markdown. Structured records and local validation in [Spec 13](13-tooling-contracts.md) become worthwhile only if manual maintenance errors or volume justify them.

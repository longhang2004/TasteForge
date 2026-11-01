# Independent, neutral-first reviews

Two fresh AI reviewers inspected the same twelve anonymous views. r1 (`gpt-6.1-sol`) used packet order; r2 (`gpt-6.1-terra`) used reverse order. Each inspected all 48 neutral images before the operator released the 36 authored images. Exact backend snapshots and inference seeds are not available. The conditions/models/case sources were withheld; visual hints may still compromise blindness. These reviewers are not representative end users.

- r1: [initial neutral judgments](reviewer-r1.neutral.json), [separate authored-stage notes](reviewer-r1.authored.json).
- r2: [initial neutral judgments](reviewer-r2.neutral.json), [separate authored-stage notes](reviewer-r2.authored.json).
- [Dimension ratings with revealed case mapping](ratings.csv).
- [Instructions and anchors](instructions.md), [neutral packet](neutral-packet.json), [authored packet](authored-packet.json), [packet image hashes](packet-hashes.json).

Neutral-stage scores are retained exactly as submitted and hash-frozen before authored release. Authored-stage observations qualify them without silently changing the scores. Both reviewers saw a blank inventory row in neutral view-01 that is visible in authored images: this was a neutralizer defect, not a demonstrated app blocker. Read the report's sensitivity analysis before interpreting that pair. No overall taste or “AI slop” score is produced.

The initial review sessions were interrupted by host usage limits. r2 completed authored inspection/writing before its final validation failed; the operator later validated and hashed the saved file. r1 resumed unfinished inspection, with no condition/result feedback. No review was regenerated to seek a preferred outcome.

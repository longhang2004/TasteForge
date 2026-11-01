# @tasteforge/core

Pure deterministic context validation, hard filtering, ranking, seeded sampling, Design DNA generation, semantic tokens, and static UI audit functions. Node 20.19+, ESM, no filesystem or network operations.

The root export includes the original APIs; `@tasteforge/core/engine` omits the heavier audit parsers, and `@tasteforge/core/audit` exposes static source checks. The separate `@tasteforge/core/references` export provides catalog search/read and seeded external inspiration without loading the reference dataset for ordinary engine commands. Imported references remain distinct from validated token generation. See the TasteForge repository for schemas and examples. Original code is MIT licensed.

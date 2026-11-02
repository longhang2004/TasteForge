# Observed resources

These are observed wall intervals, including reading, creation, self-check, correction and documentation. They are not active inference/labor durations. The two interrupted cells retain their full wall span; exact quota onset is unknown. No total is obtained by summing overlapping cells.

| Cell / arm | Creator wall seconds | Provider interruption | Creator / operator corrections | Accepted root check seconds |
| --- | ---: | --- | --- | ---: |
| [fold-1](cells/fold-1/initial/creator-record.json) / promax | 386.9 | None recorded | 0 / 0 | 33.9 |
| [fold-2](cells/fold-2/final/creator-record.json) / elaya | 5749.0 | Yes; active duration unknown | 1 / 1 | 44.1 |
| [fold-3](cells/fold-3/initial/creator-record.json) / tasteforge | 410.3 | None recorded | 1 / 0 | 37.4 |
| [fold-4](cells/fold-4/initial/creator-record.json) / impeccable | 453.6 | None recorded | 0 / 0 | 42.8 |
| [relay-1](cells/relay-1/initial-valid/creator-record.json) / impeccable | 5849.3 | Yes; active duration unknown | 1 / 0 | 42.5 |
| [relay-2](cells/relay-2/initial/creator-record.json) / tasteforge | 476.4 | None recorded | 1 / 0 | 42.6 |
| [relay-3](cells/relay-3/initial/creator-record.json) / elaya | 483.6 | None recorded | 1 / 0 | 50.4 |
| [relay-4](cells/relay-4/initial/creator-record.json) / promax | 447.2 | None recorded | 1 / 0 | 41.0 |

The six uninterrupted creator spans are approximately 6.4–8.1 minutes. Root accepted-pass runs take 33.9–50.4 seconds each; these exclude earlier passes and all operator analysis. Original root passes, invalid setup work and corrections remain in [resources.json](resources.json).

Provider/resolved model identifiers, input/output/thinking/cache tokens, billing, complete tool counts, active creator time, complete operator/evaluator time and full accepted-cycle cost are unknown. The same inherited host/model setting was requested, without override; exact backend identity was not exposed. Static entry word counts (TasteForge 593, ProMax 2118, Elaya 3742, Impeccable 1585) measure document size only. They establish neither consumed tokens nor end-to-end savings.

Shared preparation, failed invocations, provider interruption, native-tool fidelity departures, harness repair, review and publication are part of the workflow. Their incomplete telemetry prevents a complete resource comparison. The quota gap is not attributed to a repository. No paid fallback was used. See [protocol amendments](protocol-amendment-03.md) and the frozen reviewer records for their observed boundaries.

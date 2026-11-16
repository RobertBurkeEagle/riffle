# T001 Gap inventory (2026-11-06)

| Spec need | Prototype before 001 impl | Gap |
|-----------|---------------------------|-----|
| Profile continuity | Present (local auth/guest) | Storage keys not on `.v1` contract; no EMAIL_TAKEN code surface |
| Skill check + genres | Present | Scoring duplicated inline; should use domain module |
| Roadmap generate | Present (4 phases) | Need ≥5 milestones; regenerate had no confirm |
| Lesson steps | Display only | No per-step completion persistence |
| Exercise difficulty | Missing | Static Fmaj7→E7 card |
| Transpose | Missing | — |
| Practice history cap | Unbounded push | Cap at 100 + richer event shape |
| Dashboard recent activity | Library scans stub only | Need practiceHistory list |
| Chord count | Reads chordBank.length | OK (stays 0 until 002) |

Resolution: extract `src/domain/*` + `src/storage/profile-store.js`, wire HTML module bootstrap, upgrade Practice + Roadmap UX.

# Tasks: Adaptive AI Coach

**Prerequisites**: 001 complete (profile, roadmap entity, practice history). 002 optional but improves prompt context.

## Phase 1: Foundational

- [ ] T001 Template prompt assembler from skill, genres, recent practice, roadmap snapshot, chord-bank highlights
- [ ] T002 Cap prompt length; store `generatedAt` + `inputsHash` on profile (extend data model carefully)
- [ ] T003 Debounced auto-regenerate when `continuousAiAdaptation` is true

## Phase 2: US1 — Learning prompt (P1)

- [ ] T004 [US1] Profile UI: view prompt, regenerate, reset to default, guidance label
- [ ] T005 [US1] Respect adaptation toggle (no auto updates when off)

## Phase 3: US2 — Custom plan (P1)

- [ ] T006 [US2] Plan generator returns Roadmap-shaped JSON (template mode first)
- [ ] T007 [US2] Confirm overwrite/merge before save
- [ ] T008 [US2] Fallback notice → rule-based 001 generator when planner unavailable
- [ ] T009 [US2] Optional LLM adapter behind same interface (config-gated)

## Phase 4: US3 — Tips (P3)

- [ ] T010 [US3] Curated static tips feed file with attribution
- [ ] T011 [US3] Optional dashboard tip surface
- [ ] T012 [US3] Document server-side refresh design; do not scrape illegally

## Polish

- [ ] T013 Schema validation tests for AI/template roadmap output
- [ ] T014 Quickstart: prompt visible; custom plan replaces roadmap after confirm; offline fallback works

# Tasks: Library, Chord Extraction & Chord Bank

**Prerequisites**: 001 foundation (profile store, exercise/transpose domain)

## Phase 1: Setup

- [ ] T001 Replace library placeholder copy with real empty state + actions in library view
- [ ] T002 [P] Add `src/domain/chords.js` and `src/domain/extract-text.js`

## Phase 2: Foundational

- [ ] T003 Chord normalize + dedupe helpers with unit tests
- [ ] T004 [P] Text chart extractor returning `ExtractionResult`
- [ ] T005 Library CRUD via profile `library[]` with size limits
- [ ] T006 Chord bank upsert/remove via profile `chordBank[]`

## Phase 3: US1 — Library (P1)

- [ ] T007 [US1] Add text/note item flow
- [ ] T008 [US1] File picker with type/size validation
- [ ] T009 [US1] Detail pane: open/rename/delete confirm
- [ ] T010 [US1] Persist + reload verification

## Phase 4: US2 — Extract & bank (P1)

- [ ] T011 [US2] Extract action + review UI (accept subset)
- [ ] T012 [US2] Merge into chord bank with source id
- [ ] T013 [US2] Manual chord add/remove
- [ ] T014 [US2] Empty/error extraction messaging

## Phase 5: US3 — Song/bank exercises (P2)

- [ ] T015 [US3] Practice this song entry point
- [ ] T016 [US3] Build exercise from selected bank chords
- [ ] T017 [US3] Reuse difficulty/transpose; log history meta

## Phase 6: Polish

- [ ] T018 Dashboard recent scans / chord count widgets bind to real data
- [ ] T019 Run quickstart.md
- [ ] T020 [P] Document OCR adapter hook for later without implementing vendor lock-in

## MVP cut line

US1 + US2 required; US3 completes constitution “songs drive learning.”

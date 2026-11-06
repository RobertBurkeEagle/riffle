# Tasks: Core Learning Loop

**Input**: Design documents from `/specs/001-core-learning-loop/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: US1…US5 mapping

## Phase 1: Setup

- [ ] T001 Inventory current `riffle_web_app.html` behaviors vs spec gaps (difficulty UI, transpose, roadmap regenerate confirm)
- [ ] T002 [P] Add `tests/unit` harness stub (or document manual-only until extraction)
- [ ] T003 [P] Create `src/domain` and `src/storage` folders (even if re-exported from HTML later)

---

## Phase 2: Foundational

- [ ] T004 Implement Profile store contract ops in `src/storage/profile-store.js` (list/get/upsert/session/auth/guest)
- [ ] T005 [P] Implement skill scoring helpers in `src/domain/skill-check.js`
- [ ] T006 [P] Implement `transposeChord` + clamp in `src/domain/transpose.js`
- [ ] T007 [P] Implement roadmap template generator in `src/domain/roadmap.js`
- [ ] T008 [P] Implement exercise presets (chord/strum × difficulty) in `src/domain/exercises.js`
- [ ] T009 Wire storage + domain into app bootstrap without losing existing profile keys (`chordBank`, `library`, preferences)

**Checkpoint**: Foundation ready — stories can proceed

---

## Phase 3: User Story 1 — Profile continuity (P1) 🎯 MVP

**Goal**: Sign up, sign in, guest, sign out, reload restore  
**Independent Test**: Spec US1 acceptance scenarios

- [ ] T010 [US1] Align auth gate UI with validation and error codes from contract
- [ ] T011 [US1] Ensure `createProfile` / persist / session match data-model.md
- [ ] T012 [US1] Guest creation path sets `isGuest` and sidebar labeling
- [ ] T013 [US1] Sign-out clears session and returns auth gate
- [ ] T014 [US1] Reload restores session profile end-to-end

**Checkpoint**: Continuity works without roadmap/practice

---

## Phase 4: User Story 2 — Skill & genres (P1)

**Goal**: Skill check + genre prefs saved  
**Independent Test**: Spec US2

- [ ] T015 [US2] Skill-check modal uses shared question bank + scoring thresholds
- [ ] T016 [US2] Manual skill radio + multi-genre save on Profile view
- [ ] T017 [US2] Retake skill check updates `skillLevel` and `skillCheckDone`
- [ ] T018 [US2] Dashboard stats reflect skill and genres after save

**Checkpoint**: Preferences durable

---

## Phase 5: User Story 3 — Roadmap (P1)

**Goal**: Generate, browse, progress, regenerate with confirm  
**Independent Test**: Spec US3

- [ ] T019 [US3] Block generate when genres empty; show guidance
- [ ] T020 [US3] Generate ordered milestones from skill×genre templates
- [ ] T021 [US3] Lesson view renders steps; support step/milestone completion
- [ ] T022 [US3] Dashboard next CTA binds to first incomplete milestone
- [ ] T023 [US3] Regenerate warns and replaces roadmap after confirm

**Checkpoint**: Planning spine usable

---

## Phase 6: User Story 4 — Exercises (P2)

**Goal**: Chord/strum practice with difficulty + transpose + history  
**Independent Test**: Spec US4

- [ ] T024 [US4] Practice view: choose mode; default difficulty from skill
- [ ] T025 [US4] Difficulty control remaps progression/pattern density
- [ ] T026 [US4] Transpose controls update chord labels; clamp with feedback
- [ ] T027 [US4] Log PracticeEvent into capped `practiceHistory`

**Checkpoint**: Daily practice verb works

---

## Phase 7: User Story 5 — Dashboard continuity (P2)

**Goal**: Home summarizes state and recent activity  
**Independent Test**: Spec US5

- [ ] T028 [US5] Dashboard empty states for missing roadmap / no history
- [ ] T029 [US5] Recent activity list from practiceHistory
- [ ] T030 [US5] Chord count widget reads `chordBank.length` safely (0 until 002)

---

## Phase 8: Polish

- [ ] T031 [P] Unit tests for skill thresholds, transpose, roadmap size invariants
- [ ] T032 Run [quickstart.md](./quickstart.md) and fix gaps
- [ ] T033 [P] Update root README with how to open the app and where specs live
- [ ] T034 Extract remaining UI modules only if file size/maintainability demands it

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → US4 / US5 (US5 can start after US1+US2; full next-CTA needs US3)
- Parallel: T002–T003; T005–T008; T031/T033

## MVP cut line

Ship after Phase 5 (US1–US3) if needed; US4–US5 complete the 001 definition of done.

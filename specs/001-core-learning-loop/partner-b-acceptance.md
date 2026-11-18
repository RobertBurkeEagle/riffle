# Partner B acceptance — tickets 8, 10, 13

**Date**: 2026-11-16  
**Status**: Closed (meets acceptance against current code)

## 8 — Generate New Roadmap

- `src/domain/roadmap.js` `generateRoadmap({ skillLevel, genres })` rebuilds full `phases` / `lessons` (not title-only).
- Skill changes Phase 1 titles; primary genre switches Phase 2 travis vs strum and Phase 3 metal vs percussive.
- UI confirm on regenerate; empty genres blocked.
- Unit coverage: `tests/unit/roadmap.test.js` (≥5 milestones, unlock after complete).

## 10 — Accounts

- Local signup / sign-in / guest / session restore via `src/storage/profile-store.js` (`riffle.accounts.v1`).
- Profile carries roadmap, prefs, practice history, `chordBank`, `library`.
- Sidebar uses `currentUser.displayName`; “Alex Musician” is signup placeholder only.
- Guest labeled “Guest (local)”.

## 13 — Skill check

- Three intro questions in `src/domain/skill-check.js` → beginner / intermediate / advanced.
- Modal on first enter; retake updates `skillLevel` + `skillCheckDone`.
- Unit coverage: `tests/unit/skill-check.test.js`.

## 9 — Lesson player (guided drill)

- Lesson view: BPM, Start/Pause beat timer, current-step stage, type-specific cue (travis / percussive / capo / chords / strum).
- Complete step / Previous step; compact progress list; Mark lesson complete enabled when all steps done.
- Domain: `src/domain/lesson-player.js` + `tests/unit/lesson-player.test.js`.

## 11 — Cloud sync

- **Deferred / blocked** on infrastructure.
- UI: “Local backup tools” + export/import JSON interim path.
- Documented in root `README.md`.

## 12 — Learning prompt / Continuous AI Adaptation

- `src/domain/learning-prompt.js`: template prompt + `inputsHash` / `generatedAt`.
- Adaptation on → debounced refresh after practice/lesson; off → frozen “Adaptation is off” text.
- Profile: Regenerate prompt / Reset to default; guidance label.
- Tests: `tests/unit/learning-prompt.test.js`.

## 14 — Fretboard diagrams

- **Later** — depends on chord bank from Partner A / spec 002. Noted in `ideas.txt` and `specs/README.md`.

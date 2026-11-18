# Implementation Plan: Core Learning Loop

**Branch**: `001-core-learning-loop` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-learning-loop/spec.md`

## Summary

Deliver the continuity spine of Riffle: local profiles (sign-in, sign-up, guest), skill
check + genre preferences, roadmap generation and lesson playback, chord/strum practice
with difficulty and transpose, and a dashboard that makes "what's next" obvious.

Approach: evolve the existing single-file prototype (`riffle_web_app.html`) into a
maintainable front-end module structure while keeping a **Profile storage contract** so
later cloud sync (and specs 002–004) plug in without rewriting product logic. Initial
roadmap/exercise engines remain deterministic rule engines; adaptive AI is deferred to
003.

## Technical Context

**Language/Version**: JavaScript (ES2022+), HTML5, CSS via Tailwind CDN (current) → migrate toward Vite + vanilla JS or lightweight React if module boundaries demand it

**Primary Dependencies**: Tailwind CSS, Lucide icons (existing); Web Crypto for password hashing (existing)

**Storage**: `localStorage` profile map + session id (contract in `contracts/profile-store.md`); cloud sync out of scope for 001 beyond preference flag

**Testing**: Manual quickstart checklist + lightweight pure-function unit tests for skill scoring, transpose, and roadmap generation (Node test runner or browser assert harness)

**Target Platform**: Modern desktop/mobile browsers (Chromium, Firefox, Safari last two versions)

**Project Type**: Web application (client-first MVP)

**Performance Goals**: Roadmap generate < 5s; UI interactions < 100ms perceived; profile save synchronous and reliable for ≤ 2MB serialized JSON

**Constraints**: Works offline for core loop; no mandatory backend in 001; constitution continuity rules; do not break existing profile shape keys used by library stub (`chordBank`, `library`)

**Scale/Scope**: Single learner per session; dozens of local profiles max; roadmap ~5–15 milestones; practice history capped/rotated (e.g. last 100 events)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Practice Continuity First | PASS | Profile contract + dashboard restore are central |
| Skill-Appropriate by Default | PASS | Skill check, manual skill, difficulty defaults |
| Songs Drive Learning | N/A → DEFER | Owned by 002; 001 leaves `chordBank`/`library` intact |
| Spec Before Code | PASS | Spec complete prior to tasks |
| Honest Feedback, Safe Defaults | PASS | Guest clarity; clamp transpose; no mic claims in 001 |

**Post-design re-check**: PASS — no constitution amendments required.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-learning-loop/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── profile-store.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
# Near-term (MVP evolution from prototype)
riffle_web_app.html          # current spike — keep runnable during extraction
src/                         # target extraction
├── domain/
│   ├── profile.js
│   ├── skill-check.js
│   ├── roadmap.js
│   ├── exercises.js
│   └── transpose.js
├── storage/
│   └── profile-store.js
├── ui/
│   ├── auth.js
│   ├── dashboard.js
│   ├── profile-view.js
│   ├── roadmap-view.js
│   └── practice-view.js
└── main.js

tests/
├── unit/
│   ├── skill-check.test.js
│   ├── transpose.test.js
│   └── roadmap.test.js
└── manual/
    └── quickstart-checklist.md   # mirror of quickstart.md
```

**Structure Decision**: Start by hardening domain logic inside/alongside the existing HTML
spike, then extract `src/domain` + `src/storage` modules without requiring a backend.
Full Vite split is optional polish after stories pass independently.

## Complexity Tracking

> No constitution violations requiring justification.

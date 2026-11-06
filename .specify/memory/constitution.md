# Riffle Constitution

## Core Principles

### I. Practice Continuity First

Riffle exists so a guitarist can pick up where they left off. Account state, skill level,
genres, roadmap progress, chord bank, library, and practice history are first-class.
Features that do not persist meaningfully across sessions are incomplete.

Every change MUST preserve or improve continuity for signed-in profiles. Guest mode is
allowed for exploration but MUST clearly communicate that progress may be limited or
local-only until an account exists.

### II. Skill-Appropriate by Default

The product MUST tailor difficulty, roadmap milestones, exercises, and coaching tone to
the learner's declared or assessed skill level and genre interests. Generic one-size
content is a fallback, not the primary experience.

Difficulty options and transposition controls are required for generated exercises so
learners can stretch or simplify without leaving the practice flow.

### III. Songs Drive Learning

Uploading or scanning real music and turning it into chords, saved assets, and custom
exercises is a core value loop—not a side tool. Chord extraction feeds the chord bank;
the chord bank and song context feed practice; practice updates the roadmap.

When song-derived learning and generic curriculum conflict, prefer song-derived paths
that still respect skill level.

### IV. Spec Before Code

Non-trivial features follow Spec-Driven Development: constitution → specify → plan →
tasks → implement. Specs describe user value and testable requirements without
premature stack lock-in. Plans and tasks may name technologies; specs MUST NOT.

Clarifications that change scope, privacy, or UX MUST be resolved in the spec before
implementation proceeds past spikes.

### V. Honest Feedback, Safe Defaults

Interactive listening and play-along features MUST fail gracefully: clear permission
prompts, audible/visual feedback the user can trust, and no false "perfect" grades when
confidence is low. Microphone and audio analysis features are progressive enhancement—
core learning MUST work without them.

Do not ship opaque AI advice as fact. Adaptive prompts and tips SHOULD be grounded in
stored profile history and labeled as guidance.

## Product Boundaries

### In scope

- Local-first profiles with a path to cloud sync
- Skill assessment, genre preference, roadmap/checklist generation
- Chord and strumming exercise generation with difficulty and transpose options
- Sheet/song library, chord extraction, chord bank, song-specific exercises
- Per-user learning prompt derived from usage and history
- Optional mic-based chord listening and interactive play-along (later phase)

### Out of scope (unless a future spec amends this)

- Social feeds, public leaderboards, or multiplayer jam rooms in MVP
- Full DAW / multi-track recording suite
- Selling or redistributing copyrighted sheet music catalogs
- Non-guitar instruments as primary targets in v1

## UX & Quality Standards

- Primary flows (onboard → preferences → roadmap → practice) MUST be completable without
  reading documentation.
- Destructive actions (delete library item, reset roadmap) require confirmation.
- Empty states MUST explain the next useful action.
- Visual language stays consistent with the existing Riffle shell (dark studio aesthetic,
  accent for primary actions) unless a dedicated design spec supersedes it.
- Accessibility: keyboard-reachable primary controls; sufficient contrast for chord
  diagrams and practice timers.

## Engineering Standards

- Prefer incremental delivery of independently testable user stories.
- Persist profile-shaped data behind a clear storage contract so local → cloud migration
  does not rewrite product logic.
- Avoid inventing parallel profile schemas; extend the shared Profile entity.
- Document assumptions in each feature spec; mark at most three critical
  `[NEEDS CLARIFICATION]` items before planning.

## Governance

- This constitution is binding for all `specs/**` work and agent-driven implementation.
- Amendments require an explicit update to this file with version bump and date.
- When a plan conflicts with the constitution, change the plan—or amend the constitution
  deliberately. Silent drift is not allowed.
- Priority order when principles conflict: **Continuity → Skill-appropriate → Songs drive
  learning → Spec before code → Honest feedback**.

**Version**: 1.0.0 | **Ratified**: 2026-11-06 | **Last Amended**: 2026-11-06

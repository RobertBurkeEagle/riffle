# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Guitarists at every skill level — beginners through advanced — who want structured practice they can resume across sessions. Primary scene: practicing at home or in a quiet personal space with a guitar nearby, often returning for short focused sessions.

## Product Purpose

Riffle makes professional, skill-aware guitar learning continuous. Learners set or assess skill and genres, follow a roadmap, practice chord and strumming work (including from their own songs), and pick up exactly where they left off. Success means returning learners always know what to practice next and never lose progress on this device.

## Positioning

Practice continuity plus song-derived learning: real music the learner cares about becomes chords, a chord bank, and exercises that update the roadmap — not a generic one-size curriculum or a social feed.

## Operating Context

Local-first profiles (sign-in, create profile, or guest). Skill check and genre preferences. Roadmap / lesson checklist. Practice room with difficulty and transpose. Sheet/song library and chord extraction (spec 002+). Optional later: adaptive coaching prompts and mic play-along. Core learning must work without microphone features.

## Capabilities and Constraints

- In scope: local profiles with a path to cloud sync; skill/genres; roadmap; chord/strum exercises; library → chord bank → practice; per-user learning prompt; optional mic features later.
- Out of scope for v1: social feeds, leaderboards, multiplayer, full DAW, selling copyrighted catalogs, non-guitar as primary.
- Continuity is first-class; guest mode must communicate limited persistence.
- Honest feedback and safe defaults for listening features; AI guidance labeled as guidance.
- Current UI was a placeholder; a dedicated redesign supersedes the prior dark-studio shell.
- Undecided: final cloud sync product, LLM-backed coaching depth.

## Brand Commitments

- Product name: **Riffle**.
- Visual direction (user-binding for this redesign): brighter and more inviting than the placeholder; refined, professional UI suitable for serious practice — not playful gamification or dark “studio neon.”
- Structure, copy, layout, and brand marks may all change as part of the redesign; preserve product truth and working behavior, not the placeholder look.

## Evidence on Hand

- Specs under `specs/` (001–004) and constitution at `.specify/memory/constitution.md`.
- Runnable app: `riffle_web_app.html` via `npm start` (http://localhost:5173/riffle_web_app.html).
- No customer testimonials, press, or licensed photography on hand — do not fabricate commercial claims.

## Product Principles

1. Continuity first — every session restores meaningful progress.
2. Skill-appropriate by default across the full beginner–advanced range.
3. Songs drive learning when available; generic curriculum is fallback.
4. Honest, labeled guidance; core flows work without advanced sensors.
5. Primary flows completable without reading documentation.

## Accessibility & Inclusion

Keyboard-reachable primary controls; sufficient contrast for practice UI (chords, timers, status). Support learners across skill levels without assuming prior music-theory literacy in first-run copy.

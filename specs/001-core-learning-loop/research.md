# Research: Core Learning Loop

**Feature**: 001-core-learning-loop | **Date**: 2026-11-06

## Decision 1: Local-first auth for MVP

**Decision**: Keep email/password profiles and guest mode in `localStorage` with SHA-256
hashed passwords (namespaced salt string), matching the current prototype.

**Rationale**: Matches continuity needs without blocking product iteration on backend
auth. Guest path supports exploration.

**Alternatives considered**:
- Firebase/Auth0 immediately — stronger security, but delays MVP and couples early UX to vendor.
- Anonymous-only — fails continuity across devices and weakens "account" idea in ideas.txt.

## Decision 2: Rule-based roadmap before LLM plans

**Decision**: Generate roadmaps from templates keyed by skill × genre affinity.

**Rationale**: Deterministic, testable, offline, and good enough for SC-003. Spec 003
upgrades to adaptive/LLM plans using the same Roadmap entity.

**Alternatives considered**:
- Always-on LLM generation — needs API keys, latency, and offline failure modes too early.
- Static single curriculum — violates skill-appropriate principle.

## Decision 3: Difficulty + transpose as pure domain functions

**Decision**: Implement `difficulty` presets and `transposeChord(name, semitones)` as
pure functions consumed by the practice UI.

**Rationale**: Independently testable; reusable by song exercises in 002 and mic modes in 004.

**Alternatives considered**:
- Hard-coded separate exercises per key — combinatorial explosion.
- Audio-only transposition — unnecessary without playback engine.

## Decision 4: Incremental modularization, not rewrite

**Decision**: Preserve `riffle_web_app.html` behavior while extracting domain/storage;
avoid a big-bang framework rewrite in 001.

**Rationale**: Prototype already encodes profile shape and UX shell. Rewrite risk threatens
continuity demos.

**Alternatives considered**:
- Immediate React/Next rewrite — cleaner long-term, slower to validate learning loop.
- Remain forever single-file — blocks testing and multi-contributor specs.

## Decision 5: Practice history retention policy

**Decision**: Append practice events; retain last 100 by default; dashboard shows last 5–10.

**Rationale**: Prevents unbounded localStorage growth while keeping continuity visible.

**Alternatives considered**: Unlimited history — storage risk. No history — breaks continuity principle.

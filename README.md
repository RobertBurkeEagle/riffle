# Riffle

Professional guitar learning with practice continuity — skill-aware roadmaps, song-derived
chords/exercises, and a path to adaptive coaching and mic play-along.

## Spec Kit (start here for product work)

Full Spec-Driven Development kit:

- **Constitution**: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
- **Feature index**: [`specs/README.md`](specs/README.md)
- **Ideas scratchpad**: [`ideas.txt`](ideas.txt)

| Spec | What it covers |
|------|----------------|
| [001-core-learning-loop](specs/001-core-learning-loop/) | Accounts, skill/genres, roadmap, exercises, dashboard |
| [002-library-chord-bank](specs/002-library-chord-bank/) | Upload/scan, chord extract, chord bank, song practice |
| [003-adaptive-ai-coach](specs/003-adaptive-ai-coach/) | Per-user prompt, custom plans, curated tips |
| [004-mic-interactive-practice](specs/004-mic-interactive-practice/) | Mic chord listen, play-along, challenge lane |

Cursor commands: `.cursor/commands/speckit-*.md` (`constitution`, `specify`, `plan`, `tasks`, `implement`).

## Run the app

ES modules need a local server (opening the HTML file directly will not load `src/`):

```bash
npm start
```

Then open http://localhost:5173/riffle_web_app.html

```bash
npm test
```

Local profiles use `localStorage` keys `riffle.accounts.v1` / `riffle.session.v1`
(see `specs/001-core-learning-loop/contracts/profile-store.md`). Legacy keys migrate automatically.

## Account continuity

- Sign-in / guest profiles keep skill, genres, roadmap, practice history, library, and chord bank on this device.
- **Cloud sync is deferred.** Preferences → “Local backup tools” reveals JSON export/import as the interim way to copy a profile (including library + chord bank) between devices. Real multi-device sync needs backend infrastructure (Partner B ticket 11).
- Continuous AI Adaptation rebuilds the per-profile learning prompt from skill, genres, and recent practice (template mode; no LLM required).

## Suggested build order

1. **001** core loop — implemented (see `specs/001-core-learning-loop/tasks.md`)
2. Partner B lesson player + learning prompt — see `specs/001-core-learning-loop/partner-b-acceptance.md`
3. Implement **002** (songs → chords → exercises); fretboard diagrams after chord bank
4. Layer **003** when you want LLM custom plans
5. Treat **004** as a post-MVP maybe

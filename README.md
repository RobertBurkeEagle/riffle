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

## Prototype

Open [`riffle_web_app.html`](riffle_web_app.html) in a modern browser. Local profiles use
`localStorage` (see `specs/001-core-learning-loop/contracts/profile-store.md`).

## Suggested build order

1. Finish **001** tasks (continuity spine).
2. Implement **002** (songs → chords → exercises).
3. Layer **003** when you want adaptive plans.
4. Treat **004** as a post-MVP maybe.

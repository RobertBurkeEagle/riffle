# Riffle Spec Kit

Spec-Driven Development artifacts for **Riffle** — a professional guitar learning app
that keeps practice continuity, adapts to skill and genres, and turns real songs into
chords, exercises, and a living roadmap.

## Source of truth

| Artifact | Path | Role |
|----------|------|------|
| Ideas backlog | [`ideas.txt`](../ideas.txt) | Raw product brainstorm |
| Constitution | [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) | Binding principles |
| Prototype | [`riffle_web_app.html`](../riffle_web_app.html) | Current local-first UI spike |

## Feature roadmap (specs)

| ID | Feature | Status | Priority |
|----|---------|--------|----------|
| [001](001-core-learning-loop/) | Accounts, skill/genres, roadmap, practice loop | Spec + plan + tasks | P0 MVP |
| [002](002-library-chord-bank/) | Upload/scan, chord extract, chord bank, song exercises | Spec + plan + tasks | P0 MVP |
| [003](003-adaptive-ai-coach/) | Custom learning prompt, adaptive plan, curated tips | Spec ready | P1 |
| [004](004-mic-interactive-practice/) | Mic chord listen, play-along, real-guitar scoring | Spec draft (maybe) | P2 |

## Recommended workflow

1. Read the constitution.
2. Implement **001** then **002** for MVP.
3. Use Cursor commands in [`.cursor/commands/`](../.cursor/commands/) for specify / plan / tasks / implement cycles on follow-on work.
4. Keep `ideas.txt` as a scratchpad; promote ideas into specs before building.

## MVP definition of done

A learner can:

1. Create or resume a profile (or explore as guest).
2. Complete a short skill check and set genres.
3. Generate a roadmap/checklist matched to skill + genres.
4. Run chord/strumming exercises with difficulty and transpose controls.
5. Upload or scan a song, extract chords into a chord bank, and get song-specific exercises.
6. See practice history reflected in continuity (dashboard / prompt / roadmap progress).

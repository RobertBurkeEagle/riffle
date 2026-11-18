# Data Model: Core Learning Loop

**Feature**: 001-core-learning-loop | **Date**: 2026-11-06

## Entity: Profile

| Field | Type | Notes |
|-------|------|-------|
| id | string | Stable unique id |
| displayName | string | Required for non-empty UX |
| email | string \| null | Unique among non-guest when present |
| passwordHash | string \| null | Null for guests |
| isGuest | boolean | Guest continuum flag |
| skillLevel | `beginner` \| `intermediate` \| `advanced` \| null | From check or manual |
| genres | string[] | Controlled vocabulary tags |
| skillCheckDone | boolean | Gates first-run modal |
| preferences.continuousAiAdaptation | boolean | Consumed by 003; stored now |
| preferences.cloudSync | boolean | Future; stored now |
| practiceHistory | PracticeEvent[] | Newest last or first — pick one and stick |
| learningPrompt | string | Generated text; owned more by 003 |
| roadmap | Roadmap \| null | Embedded for local-first simplicity |
| chordBank | ChordEntry[] | Owned by 002; must remain |
| library | LibraryItem[] | Owned by 002; must remain |
| dayCount | number | Soft streak / day index |
| createdAt | ISO string | |
| updatedAt | ISO string | |

**Validation**:
- Email lowercase trim when present
- genres ⊆ allowed set
- skillLevel in enum when not null
- practiceHistory length ≤ 100 (drop oldest)

## Entity: SkillAssessment (ephemeral + derived)

| Field | Type | Notes |
|-------|------|-------|
| answers | number[] | Per-question scores |
| derivedLevel | skill enum | Sum thresholds |
| completedAt | ISO string | Written when done |

**Thresholds (initial)**: sum 0–2 beginner; 3–4 intermediate; 5+ advanced (3 questions × 0–2).

## Entity: Roadmap

| Field | Type | Notes |
|-------|------|-------|
| generatedAt | ISO string | |
| skillLevel | skill enum | Snapshot used to generate |
| genres | string[] | Snapshot |
| milestones | Milestone[] | Ordered |

### Milestone

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| title | string | |
| genreHint | string \| null | |
| status | `todo` \| `active` \| `done` | |
| steps | { id, text, done }[] | Lesson steps |

## Entity: ExerciseSession (runtime; may optionally log)

| Field | Type | Notes |
|-------|------|-------|
| mode | `chord` \| `strum` | |
| difficulty | `easy` \| `standard` \| `challenge` | Map from skill default |
| transpose | integer | Semitones; clamp e.g. −6..+6 |
| chordProgression | string[] | Display names after transpose |
| patternId | string \| null | Strum pattern key |

## Entity: PracticeEvent

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| type | string | e.g. `chord-transition`, `strum-pattern`, `lesson-complete` |
| summary | string | Human-readable |
| at | ISO string | |
| meta | object | Optional refs (milestoneId, transpose, difficulty) |

## Relationships

```text
Profile 1──1 Roadmap?
Profile 1──* PracticeEvent
Profile 1──* ChordEntry     (002)
Profile 1──* LibraryItem    (002)
Roadmap 1──* Milestone
Milestone 1──* Step
```

## State transitions

- `skillCheckDone: false → true` on assessment finish
- Milestone `todo → active → done` as user progresses
- Roadmap regenerate: replace roadmap after confirm; optional archive not required in 001

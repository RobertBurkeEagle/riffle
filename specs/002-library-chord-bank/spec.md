# Feature Specification: Library, Chord Extraction & Chord Bank

**Feature Branch**: `002-library-chord-bank`

**Created**: 2026-11-06

**Status**: Ready for planning

**Input**: User description: "Upload/scan a song or sheet music and get the chords and save to account; provide chords/save to chord bank; offer custom exercises for that song or chord bank; save sheet music like a notes app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save songs and sheet music to a personal library (Priority: P1)

A learner uploads a file (PDF, image, or text chart) or creates a note-like sheet entry.
Items appear in their library, can be opened, renamed, and deleted with confirmation.

**Why this priority**: Without a durable library, extraction and song exercises have nowhere to live.

**Independent Test**: Upload/create two items, reload, both remain under the same profile.

**Acceptance Scenarios**:

1. **Given** a signed-in or guest profile, **When** the user adds a library item (upload or pasted chart), **Then** it appears in the library list with title and timestamp.
2. **Given** a library item, **When** the user opens it, **Then** they see stored content or a preview placeholder when binary preview is unavailable.
3. **Given** a library item, **When** the user deletes it after confirm, **Then** it is removed from the profile library.
4. **Given** storage near quota, **When** an oversized upload is attempted, **Then** the user gets a clear failure and the library remains intact.

---

### User Story 2 - Extract chords from a song and save to chord bank (Priority: P1)

From a library item, the learner runs chord extraction and reviews detected chords.
Accepted chords merge into their account chord bank (deduplicated).

**Why this priority**: Chord bank is the bridge from songs to practice.

**Independent Test**: Run extract on a text chart with known chords; accept results; chord bank contains those chords.

**Acceptance Scenarios**:

1. **Given** a library item with readable chord content (text chart or OCR-ready image in supported path), **When** the user runs Extract chords, **Then** a review list of candidate chords is shown.
2. **Given** extraction results, **When** the user accepts all or a subset, **Then** accepted chords are upserted into `chordBank` with source reference to the library item.
3. **Given** chords already in the bank, **When** the same chord is accepted again, **Then** the bank does not create noisy duplicates (merge by normalized name).
4. **Given** extraction fails or confidence is low, **When** results return, **Then** the UI explains the failure and offers manual chord entry.

---

### User Story 3 - Practice from a song or the chord bank (Priority: P2)

The learner generates custom chord/strum exercises from a specific song’s chords or from
selected chord-bank entries, with difficulty and transpose controls consistent with 001.

**Why this priority**: Closes the songs-drive-learning loop.

**Independent Test**: From a song with ≥2 saved chords, start a song exercise; transpose works; practice event logs song id.

**Acceptance Scenarios**:

1. **Given** a library item with saved chords, **When** the user chooses Practice this song, **Then** an exercise session uses that song’s chord set.
2. **Given** a non-empty chord bank, **When** the user builds an exercise from selected bank chords, **Then** the session uses exactly those chords.
3. **Given** a song/bank exercise, **When** difficulty or transpose changes, **Then** behavior matches core practice rules from 001.
4. **Given** completion, **When** the event is logged, **Then** history references the song and/or chord list.

### Edge Cases

- Unsupported file types are rejected before upload completes.
- OCR/scan path unavailable → manual text chart still works (MVP-safe path).
- Deleting a library item does not necessarily delete chord-bank entries that originated from it; entries keep optional `sourceId` that may become stale (show “source removed”).
- Empty extraction (no chords found) prompts manual add.
- Concurrent edits: last write wins for local-first; no multi-device merge in 002.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST let users add library items via file upload and via pasted/typed chart text.
- **FR-002**: System MUST persist library items on the user profile across sessions.
- **FR-003**: Users MUST be able to rename, open, and delete library items (delete confirmed).
- **FR-004**: System MUST extract chord candidates from text charts.
- **FR-005**: System SHOULD support image/PDF scan-to-text when a scan pipeline is configured; otherwise MUST degrade to manual text entry without blocking the feature.
- **FR-006**: Users MUST review and accept/reject extracted chords before bank merge.
- **FR-007**: System MUST maintain a per-profile chord bank with normalized chord names.
- **FR-008**: Users MUST be able to manually add/remove chord-bank entries.
- **FR-009**: System MUST generate exercises from a song’s chords or selected bank chords.
- **FR-010**: Song/bank exercises MUST support difficulty and transpose consistent with 001.
- **FR-011**: Library UI MUST show empty states that point to upload/paste actions.
- **FR-012**: System MUST associate accepted chords with source library item id when available.

### Key Entities

- **LibraryItem**: id, title, type (`text`|`image`|`pdf`|`note`), contentRef or inline text, createdAt, updatedAt, lastExtractAt, extractedChords[].
- **ChordEntry**: id, symbol (e.g. `Fmaj7`), normalizedKey, tags[], sourceLibraryId?, addedAt, proficiency? (optional future).
- **ExtractionResult**: candidates[{ symbol, confidence?, positions? }], status, warnings[].
- **SongExerciseRequest**: source (`song`|`bank`), chordSymbols[], difficulty, transpose.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a text chart and see it in the library after reload (100% in manual test matrix).
- **SC-002**: From a well-formed text chart containing 4 distinct chords, extraction + accept yields those 4 in the chord bank within 1 minute.
- **SC-003**: 90% of testers can start a song-based exercise from an item that already has chords without help.
- **SC-004**: Unsupported uploads fail with actionable messaging; no silent data loss.

## Assumptions

- MVP extraction focuses on text chord charts (e.g. `Am | G | C | F`); OCR is progressive enhancement.
- Copyrighted uploads are user-private study copies; Riffle does not redistribute catalogs.
- Binary files may be stored as local Object URLs or base64 with size limits; cloud blob storage waits on sync work.
- Chord vocabulary uses common guitar chord spellings; complex classical figuration is out of scope for auto-extract.

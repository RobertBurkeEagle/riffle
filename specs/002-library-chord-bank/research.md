# Research: Library & Chord Bank

## Decision 1: Text-first extraction MVP

**Decision**: Ship regex/token parsing for chord charts first; treat OCR/PDF as optional adapter returning the same `ExtractionResult`.

**Rationale**: Unblocks songs-drive-learning without waiting on ML/OCR vendors. Matches FR-005 degradation requirement.

**Alternatives**: Cloud music-recognition APIs (cost, privacy, latency); manual-only (too weak vs ideas.txt).

## Decision 2: Embed library blobs carefully

**Decision**: Store text inline; for images/PDFs store metadata + capped base64 or defer binary to later cloud blobs with local stub preview.

**Rationale**: localStorage quotas make large PDFs unsafe; continuity still works for charts.

## Decision 3: Normalize chords for dedupe

**Decision**: Normalize (`Db`≡`C#` policy documented; quality suffixes canonicalized) before chord-bank upsert.

**Rationale**: Prevents duplicate clutter that undermines exercise generation.

## Decision 4: Reuse 001 exercise engine

**Decision**: Song/bank practice calls into `exercises.js` + `transpose.js` with an injected chord list.

**Rationale**: One practice UX; constitution consistency.

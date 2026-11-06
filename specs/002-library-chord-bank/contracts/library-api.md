# Contract: Library & Chord Extraction (client module)

## `addLibraryItem(input) → LibraryItem`

Input: `{ title, type, textContent?, file? }`  
Validates type/size; persists via profile upsert.

## `listLibraryItems() → LibraryItemSummary[]`

Sorted by `updatedAt` desc.

## `getLibraryItem(id) → LibraryItem | null`

## `updateLibraryItem(id, patch) → LibraryItem`

## `deleteLibraryItem(id) → void`

Requires UI-level confirm before call.

## `extractChords(itemId | { text }) → ExtractionResult`

Pure parsing for text; adapters may preprocess scans to text.

## `acceptChords(itemId, symbols[]) → ChordEntry[]`

Merges into chord bank; updates item `extractedChords`.

## `listChordBank() → ChordEntry[]`

## `addChordManual(symbol) → ChordEntry`

## `removeChord(id) → void`

## `startSongExercise({ itemId?, chordIds?, difficulty, transpose }) → ExerciseSession`

Delegates to core exercise engine.

# Data Model: Library & Chord Bank

## LibraryItem

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| title | string | Editable |
| type | `text` \| `image` \| `pdf` \| `note` | |
| textContent | string \| null | Charts / notes |
| mediaDataUrl | string \| null | Optional capped |
| byteSize | number | For quota UX |
| extractedChords | string[] | Last accepted set for item |
| lastExtractAt | ISO \| null | |
| createdAt / updatedAt | ISO | |

## ChordEntry

| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| symbol | string | Display form |
| normalized | string | Dedupe key |
| sourceLibraryId | string \| null | May be stale |
| addedAt | ISO | |
| tags | string[] | Optional |

## ExtractionResult

| Field | Type | Notes |
|-------|------|-------|
| status | `ok` \| `empty` \| `error` | |
| candidates | { symbol, normalized, confidence? }[] | |
| warnings | string[] | |

## Validation rules

- Title non-empty after trim
- `byteSize` ≤ configured max
- `normalized` required before bank upsert
- Bank unique on `normalized`

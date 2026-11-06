# Implementation Plan: Library, Chord Extraction & Chord Bank

**Branch**: `002-library-chord-bank` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

## Summary

Replace the library placeholder with a real personal sheet/song library, text-first chord
extraction into a deduplicated chord bank, and song/bank-driven exercises that reuse 001
practice domain functions.

## Technical Context

**Language/Version**: Same client stack as 001  
**Primary Dependencies**: Existing UI shell; optional later OCR/WASM or API for scans  
**Storage**: Profile-embedded `library[]` + `chordBank[]` via profile-store contract  
**Testing**: Unit tests for chord parsing/normalization; manual upload quickstart  
**Target Platform**: Modern browsers with File API  
**Project Type**: Web application (client-first)  
**Performance Goals**: Text extract < 1s for typical charts; UI list remains smooth for ≤200 items  
**Constraints**: localStorage quota — enforce per-file size cap (e.g. 1.5MB) and total budget warning  
**Scale/Scope**: Personal library tens–low hundreds of items

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Continuity | PASS | Library + bank on profile |
| Skill-appropriate | PASS | Exercises reuse skill defaults |
| Songs drive learning | PASS | Primary delivery of this principle |
| Spec before code | PASS | |
| Honest feedback | PASS | Low-confidence / unsupported paths explained |

## Project Structure

```text
specs/002-library-chord-bank/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/library-api.md
├── checklists/requirements.md
└── tasks.md

src/domain/chords.js          # parse, normalize, merge
src/domain/extract-text.js    # text chart extraction
src/ui/library-view.js
```

**Structure Decision**: Extend profile store; keep extraction pure and swappable so OCR can plug behind the same `ExtractionResult` contract.

## Complexity Tracking

No constitution violations.

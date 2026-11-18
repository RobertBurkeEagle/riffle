---
description: Create or update a feature specification from a natural-language description.
---

Create or update a Spec Kit feature under `specs/` from the user's description.

Execution:
1. Read `.specify/memory/constitution.md` and `.specify/templates/spec-template.md`.
2. If no feature directory exists, create `specs/NNN-short-name/` with next NNN.
3. Write `spec.md` with: User Scenarios & Testing, Requirements, Success Criteria, Assumptions.
4. Focus on what/why — no stack lock-in in FRs.
5. Max 3 `[NEEDS CLARIFICATION]` markers; prefer documented assumptions.
6. Write `checklists/requirements.md` and mark validation items.
7. Do not invent implementation tasks here (that is plan/tasks).

User description:
$ARGUMENTS

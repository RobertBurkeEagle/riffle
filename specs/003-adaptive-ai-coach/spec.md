# Feature Specification: Adaptive AI Coach

**Feature Branch**: `003-adaptive-ai-coach`

**Created**: 2026-11-06

**Status**: Spec ready (depends on 001; benefits from 002)

**Input**: User description: "Custom system prompt per user based on uses and history; generate custom learning plan; routinely gather learning tips/literature/lessons/trends from the web to train."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personal learning prompt from history (Priority: P1)

The system maintains a per-user learning prompt (system instructions) derived from skill,
genres, practice history, roadmap progress, and chord-bank focus. Users can view it on
Profile and regenerate it. When continuous AI adaptation is enabled, meaningful practice
events refresh the prompt.

**Why this priority**: This is the adaptation control surface for future coaching calls.

**Independent Test**: Complete practices with adaptation on; open Profile and see prompt text reflecting skill/genres/recent activity.

**Acceptance Scenarios**:

1. **Given** a profile with skill and genres, **When** the user saves preferences or regenerates, **Then** a non-empty learning prompt is stored and displayed.
2. **Given** `continuousAiAdaptation` enabled, **When** new practice events are logged, **Then** the prompt updates within the same session (debounced).
3. **Given** adaptation disabled, **When** the user practices, **Then** the prompt does not auto-change until manual regenerate.
4. **Given** a prompt, **When** shown in UI, **Then** it is labeled as guidance generated from profile data—not as authoritative instruction from a teacher.

---

### User Story 2 - Custom learning plan generation (Priority: P1)

Using the learning prompt and profile context, the user generates or refreshes a custom
learning plan that can replace or augment the rule-based roadmap while preserving the
Roadmap entity shape.

**Why this priority**: Ideas call for generated custom plans beyond static templates.

**Independent Test**: Generate custom plan; roadmap milestones change and remain completable in existing roadmap UI.

**Acceptance Scenarios**:

1. **Given** a profile with prompt + preferences, **When** the user generates a custom plan, **Then** a Roadmap-compatible checklist is produced and saved.
2. **Given** an existing roadmap with progress, **When** regenerating via AI plan, **Then** the user confirms overwrite or merge strategy before changes apply.
3. **Given** the planner is unavailable (offline/no key), **When** generation is requested, **Then** the app falls back to the rule-based generator with a clear notice.

---

### User Story 3 - Curated tips intake (Priority: P3)

On a routine cadence, Riffle gathers publicly available learning tips, literature pointers,
lessons, and trends, then summarizes them into an internal tips catalog that can influence
prompts or optional “Tip of the day” surfaces—without scraping behind logins or violating
site terms.

**Why this priority**: Listed as a maybe/enhancement; valuable but not MVP-blocking.

**Independent Test**: Run tips refresh in a dev/admin path; catalog stores dated entries; prompt regeneration can reference latest tips when enabled.

**Acceptance Scenarios**:

1. **Given** tips intake enabled in a controlled environment, **When** a refresh runs, **Then** new tip entries with source attribution and retrieved-at timestamps are stored.
2. **Given** a tips catalog, **When** the dashboard tip surface is enabled, **Then** a tip shows with source label.
3. **Given** a source fetch fails, **When** refresh completes, **Then** prior tips remain and failure is logged/surfaced to operators—not silently corrupting user prompts.

### Edge Cases

- Empty history still yields a coherent prompt from skill/genres alone.
- Prompt size capped to keep storage and future model context sane.
- Users can clear/reset prompt to default template.
- Tips intake MUST NOT inject untrusted raw HTML into the app shell.
- Copyrighted lesson text is linked/attributed, not republished in full.

## Requirements *(mandatory)*

- **FR-001**: System MUST generate and store a per-profile `learningPrompt` from profile context.
- **FR-002**: Users MUST be able to view and manually regenerate the prompt.
- **FR-003**: System MUST honor `preferences.continuousAiAdaptation` for auto-refresh behavior.
- **FR-004**: System MUST generate Roadmap-compatible custom plans from prompt + profile.
- **FR-005**: System MUST fall back to rule-based roadmap when adaptive planner is unavailable.
- **FR-006**: System MUST require confirmation before overwriting roadmap progress with a new plan.
- **FR-007**: System SHOULD maintain a tips catalog with attribution and timestamps.
- **FR-008**: Tips refresh MUST run only through allowed sources/config (no credential stuffing or paywall bypass).
- **FR-009**: Adaptive outputs MUST be presented as guidance.
- **FR-010**: Prompt generation MUST run client-side template assembly even when no LLM is configured; LLM enrichment is optional.

### Key Entities

- **LearningPrompt**: text, generatedAt, inputsHash, source (`template`|`llm`).
- **PlanGenerationRequest**: profile snapshot, prompt, mode (`replace`|`merge`).
- **TipEntry**: id, title, summary, sourceUrl, sourceName, retrievedAt, tags[].

## Success Criteria *(mandatory)*

- **SC-001**: With skill+genres set, users always get a readable prompt in < 2s for template mode.
- **SC-002**: Custom plan output always validates against Roadmap schema (100% of generations in test suite).
- **SC-003**: Offline/no-API path never blocks core roadmap generation.
- **SC-004**: Tips entries always include attribution fields when shown.

## Assumptions

- LLM provider is optional and configured via env/settings later; template assembly ships first.
- Web tips gathering is operator-triggered or scheduled server-side in a future backend; client MVP may use a curated static feed file.
- No autonomous browsing that ignores robots/terms.

# Feature Specification: Core Learning Loop

**Feature Branch**: `001-core-learning-loop`

**Created**: 2026-11-06

**Status**: Ready for implementation

**Input**: User description: "Account/continuity; select skill level and genres; intro skill questions; generate roadmap/checklist; generate chord/strumming exercises with difficulty and transpose; practice continuity across sessions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create or resume a practice profile (Priority: P1)

A guitarist opens Riffle and either signs in, creates a profile, or continues as a guest.
Their session restores prior skill, genres, roadmap, and practice history when a profile
exists. Guests can explore but understand continuity is limited until they create an
account.

**Why this priority**: Without continuity, every other feature resets and the product
fails its core promise.

**Independent Test**: Create a profile, set any preference, reload the app, and confirm
state is restored for that profile. Guest path reaches the app without credentials.

**Acceptance Scenarios**:

1. **Given** no active session, **When** the user creates a profile with email and password, **Then** they enter the app and a durable profile is stored.
2. **Given** an existing profile, **When** the user signs in with correct credentials, **Then** their prior skill, genres, roadmap, and history are restored.
3. **Given** no desire to register, **When** the user chooses Continue as guest, **Then** they enter the app with a guest profile and can later create a real account without blocking exploration.
4. **Given** an active session, **When** the user signs out, **Then** protected profile data is no longer shown and the auth gate returns.

---

### User Story 2 - Establish skill level and genres (Priority: P1)

A new (or returning) learner completes a short skill check and selects genres they care
about. Skill can also be set manually. These preferences drive roadmap and exercise
generation.

**Why this priority**: Skill-appropriate defaults are a constitutional requirement and
gate useful planning.

**Independent Test**: Complete skill check and genre selection without generating a
roadmap; verify profile stores skill level, genres, and skill-check completion.

**Acceptance Scenarios**:

1. **Given** a profile with skill check incomplete, **When** the user answers the intro questions, **Then** the system assigns beginner / intermediate / advanced (or equivalent) and marks the check done.
2. **Given** a profile, **When** the user selects one or more genres and saves, **Then** those genres persist and appear on the dashboard/profile summary.
3. **Given** a completed skill check, **When** the user retakes it, **Then** skill level may update and the change is saved.
4. **Given** a user who prefers manual control, **When** they set skill via profile controls without the quiz, **Then** the chosen skill is stored and usable by planners.

---

### User Story 3 - Generate and follow a learning roadmap (Priority: P1)

Based on skill and genres, the learner generates a roadmap/checklist of milestones and
lessons. They can open a lesson, mark progress, and see what to practice next on the
dashboard.

**Why this priority**: The roadmap is the organizing spine of daily practice.

**Independent Test**: With skill + genres set, generate a roadmap, open the first incomplete item, complete a step, and see dashboard "next" update.

**Acceptance Scenarios**:

1. **Given** skill and at least one genre, **When** the user generates a roadmap, **Then** they receive an ordered checklist of milestones appropriate to that skill/genre mix.
2. **Given** an existing roadmap, **When** the user opens a milestone/lesson, **Then** they see concrete practice steps for that item.
3. **Given** completed steps, **When** the user returns to dashboard or roadmap, **Then** progress and the next recommended action are visible.
4. **Given** changed skill or genres, **When** the user regenerates the roadmap, **Then** they are warned that progress may reset or be remapped, and a new plan is produced after confirm.

---

### User Story 4 - Practice chord and strumming exercises (Priority: P2)

The learner starts structured chord or strumming exercises with selectable difficulty
and optional transposition, then logs practice so history stays continuous.

**Why this priority**: Exercises are the daily verb; difficulty/transpose make them
usable across levels.

**Independent Test**: Start an exercise, change difficulty and transpose, complete or log practice, verify history entry exists on the profile.

**Acceptance Scenarios**:

1. **Given** a signed-in or guest profile, **When** the user opens Practice and chooses chord or strumming exercise, **Then** an exercise session starts with a default difficulty matching skill level.
2. **Given** an active exercise, **When** the user changes difficulty, **Then** the exercise content adjusts (tempo, chord complexity, or pattern density) without leaving the session.
3. **Given** an active exercise, **When** the user transpose up/down, **Then** displayed chord names/shapes update by the selected interval.
4. **Given** a completed or manually logged practice event, **When** the session ends, **Then** practice history records type, summary, and timestamp.

---

### User Story 5 - See continuity on the home dashboard (Priority: P2)

Returning users land on a dashboard that summarizes skill, genres, chord-bank size (even
if empty), recent activity, and the next roadmap action.

**Why this priority**: Continuity must be visible, not only stored.

**Independent Test**: After seeding profile data, open dashboard and verify summary widgets match stored profile fields.

**Acceptance Scenarios**:

1. **Given** a profile with roadmap progress, **When** the dashboard loads, **Then** the next lesson CTA reflects the first incomplete milestone.
2. **Given** practice history, **When** the dashboard loads, **Then** recent activity is listed in reverse chronological order (bounded list).
3. **Given** missing roadmap, **When** the dashboard loads, **Then** empty state prompts generating a plan after preferences are set.

### Edge Cases

- Duplicate email on signup is rejected with a clear error.
- Wrong password does not reveal whether the email exists beyond a generic failure message.
- Guest profiles may be device-local; creating an account from guest SHOULD offer to keep current local progress when feasible.
- Generating a roadmap with zero genres selected is blocked with guidance to pick at least one.
- Transpose beyond practical guitar range (±N semitones) is clamped with feedback.
- Corrupted local storage recovers to auth gate with a non-destructive reset option rather than a blank crash.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow profile creation with display name, email, and password.
- **FR-002**: System MUST authenticate returning users and restore their profile state.
- **FR-003**: System MUST support a guest continuum path into the app without credentials.
- **FR-004**: System MUST persist skill level, genres, skill-check completion, roadmap, practice history, and preferences per profile.
- **FR-005**: System MUST offer a short intro skill questionnaire that maps answers to a skill level.
- **FR-006**: Users MUST be able to select multiple genres from a predefined set and save them.
- **FR-007**: System MUST generate a roadmap/checklist from skill + genres with ordered milestones and lesson steps.
- **FR-008**: Users MUST be able to open a roadmap item and view actionable practice steps.
- **FR-009**: System MUST track roadmap completion progress and expose the next recommended action.
- **FR-010**: System MUST provide chord and strumming exercise modes.
- **FR-011**: Exercises MUST expose difficulty options (at least three levels).
- **FR-012**: Exercises MUST support transposition of chord content by semitone steps within a safe range.
- **FR-013**: System MUST record practice events into profile history.
- **FR-014**: Dashboard MUST summarize continuity signals (skill, genres, next action, recent activity).
- **FR-015**: Users MUST be able to sign out and end the active session.
- **FR-016**: Users MUST be able to retake the skill check and manually override skill level.

### Key Entities

- **Profile**: Identity, credentials/guest flag, skill level, genres, preferences, prompt text, roadmap ref, chord bank, library, practice history, timestamps.
- **SkillAssessment**: Ordered questions, chosen answers, derived skill level, completion flag.
- **GenrePreference**: Selected genre tags from a controlled vocabulary.
- **Roadmap**: Ordered milestones; each milestone has title, genre affinity, completion state, and lesson steps.
- **LessonStep**: Instructional step text and optional completion flag.
- **ExerciseSession**: Mode (chord|strum), difficulty, transpose offset, related chords/patterns, start/end.
- **PracticeEvent**: Type, label/summary, timestamp, optional links to roadmap item or song.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can create a profile and finish skill check + genre selection in under 3 minutes.
- **SC-002**: After reload, 100% of previously saved profile fields used by dashboard/roadmap/practice still restore for that profile.
- **SC-003**: With skill + genres set, roadmap generation produces a usable checklist (≥5 milestones) in under 5 seconds on a typical laptop.
- **SC-004**: 90% of first-time testers can start an exercise, change difficulty, and transpose without assistance.
- **SC-005**: Returning users can identify their next practice action from the dashboard in under 10 seconds.

## Assumptions

- v1 auth is local-first (device storage); cloud sync is preference-flagged but not required for this feature.
- Controlled genre list is sufficient (folk/acoustic, rock/alt, jazz/blues, metal, classical, expandable later).
- Roadmap content may be rule-templated initially; LLM generation can replace templates later under spec 003.
- "Professional guitar learning" targets primarily six-string guitar in standard or capoed tuning.
- Password rules remain lightweight for the local prototype; production hardening is a later security pass.

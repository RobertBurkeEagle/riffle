# Feature Specification: Mic Interactive Practice

**Feature Branch**: `004-mic-interactive-practice`

**Created**: 2026-11-06

**Status**: Draft (maybe / P2+)

**Input**: User description: "Microphone integration — listen if user plays correct chord; interactive play-along; Guitar Hero with real guitar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hear whether the chord is correct (Priority: P1)

During a chord exercise, the learner grants mic permission. Riffle analyzes incoming audio
and indicates match / close / miss against the target chord with confidence-aware UI.

**Why this priority**: Core of “listens if user is playing the correct chord.”

**Independent Test**: With mic permission, play target chord vs wrong chord; UI states differ when confidence exceeds threshold; low-confidence shows “not sure” not “perfect.”

**Acceptance Scenarios**:

1. **Given** mic permission granted, **When** a chord exercise is in listening mode, **Then** the app shows live listening state.
2. **Given** a confident match, **When** analysis completes a window, **Then** UI shows success feedback.
3. **Given** low confidence, **When** analysis runs, **Then** UI shows uncertain/miss—not a false perfect.
4. **Given** permission denied, **When** user tries listening mode, **Then** exercises still work manually and permission recovery is explained.

---

### User Story 2 - Interactive play-along (Priority: P2)

The learner plays along with a progressing chord timeline (song or exercise). Targets
advance on timer or on detected success, with a simple score summary at the end.

**Why this priority**: Extends listening into a session format.

**Independent Test**: Complete a 4-chord play-along; receive summary with hits/misses/skips.

**Acceptance Scenarios**:

1. **Given** a chord sequence, **When** play-along starts, **Then** current/next chords are visible with timing affordance.
2. **Given** listening enabled, **When** user matches before timeout, **Then** progression advances early (if mode allows).
3. **Given** session end, **When** summary shows, **Then** counts are stored as a practice event.

---

### User Story 3 - Real-guitar challenge mode (Priority: P3)

A gamified “Guitar Hero with real guitar” mode maps upcoming chords to a scrolling lane
and scores timing + pitch/chord accuracy. Clearly optional and calibrated so beginners
are not punished unfairly (skill-scaled windows).

**Why this priority**: Explicit maybe; high delight, higher complexity.

**Independent Test**: Finish one short challenge chart; score scales with skill difficulty setting.

**Acceptance Scenarios**:

1. **Given** challenge mode, **When** session runs, **Then** upcoming targets animate on a timeline lane.
2. **Given** beginner difficulty, **When** timing windows are evaluated, **Then** windows are wider than challenge difficulty.
3. **Given** no mic, **When** user opens challenge, **Then** mode explains mic requirement or offers mute/practice visual-only rehearsal.

### Edge Cases

- Multiple inputs (interface vs mic) — prefer selected device; handle device disconnect mid-session.
- Noisy rooms increase “uncertain” rate; offer sensitivity control.
- Background tabs may suspend audio — pause session with message.
- Accessibility: visual-only cues for deaf/hard-of-hearing users (never audio-only feedback).

## Requirements *(mandatory)*

- **FR-001**: System MUST request microphone permission explicitly before capture.
- **FR-002**: Core exercises MUST remain usable without mic.
- **FR-003**: Chord listening MUST expose match / miss / uncertain states tied to confidence.
- **FR-004**: System MUST NOT declare perfect accuracy when confidence is below threshold.
- **FR-005**: Play-along MUST support timed progression through a chord sequence.
- **FR-006**: Sessions MUST log PracticeEvents with mode metadata.
- **FR-007**: Challenge mode SHOULD skill-scale timing windows.
- **FR-008**: Users MUST be able to pick input device when multiple exist (where browser allows).
- **FR-009**: Stopping/pausing MUST immediately stop analyzing/recording indicators.

### Key Entities

- **AudioSession**: deviceId, permissionState, startedAt, sensitivity.
- **ChordDetection**: target, estimated, confidence, at.
- **PlayAlongRun**: sequence[], hits, misses, uncertain, durationMs.
- **ChallengeChart**: lanes/events[], difficulty, scoring rules id.

## Success Criteria *(mandatory)*

- **SC-001**: Permission-denied path never bricks Practice view.
- **SC-002**: In quiet test conditions with a clear target chord, confident-match rate is subjectively usable for at least major open chords in a lab checklist.
- **SC-003**: Uncertain state appears when signal is ambiguous (verified with silence and noise fixtures).
- **SC-004**: Play-along summary persists as practice history.

## Assumptions

- Browser Web Audio API + client-side DSP/ML is the first implementation path; native apps later.
- Perfect polyphonic transcription is not promised; chord-family detection is enough for v1 listening.
- “Guitar Hero” is an interaction metaphor, not a licensed brand implementation—use original Riffle naming in product UI (e.g. “Challenge Lane”).
- Shipping 004 happens after 001–002 are stable; can proceed without 003.

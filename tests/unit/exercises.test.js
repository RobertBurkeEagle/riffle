import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExerciseSession,
  defaultDifficultyForSkill,
  appendPracticeEvent,
  PRACTICE_HISTORY_CAP
} from '../../src/domain/exercises.js';

describe('exercises', () => {
  it('defaults difficulty from skill', () => {
    assert.equal(defaultDifficultyForSkill('beginner'), 'easy');
    assert.equal(defaultDifficultyForSkill('advanced'), 'challenge');
  });

  it('builds chord session with transpose', () => {
    const session = buildExerciseSession({
      mode: 'chord',
      difficulty: 'standard',
      skillLevel: 'intermediate',
      transpose: 2
    });
    assert.equal(session.mode, 'chord');
    assert.ok(session.chordProgression.length >= 2);
    assert.equal(session.transpose, 2);
  });

  it('caps practice history', () => {
    let history = [];
    for (let i = 0; i < PRACTICE_HISTORY_CAP + 5; i++) {
      history = appendPracticeEvent(history, { type: 't', summary: String(i) });
    }
    assert.equal(history.length, PRACTICE_HISTORY_CAP);
    assert.equal(history[0].summary, '5');
  });
});

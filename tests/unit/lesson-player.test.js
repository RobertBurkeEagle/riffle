import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLessonDrill,
  clampStepIndex,
  nextStepIndex,
  prevStepIndex,
  progressPercent,
  allStepsComplete,
  msPerBeat
} from '../../src/domain/lesson-player.js';

describe('lesson-player', () => {
  it('returns drills for travis, percussive, and capo', () => {
    const travis = getLessonDrill('travis');
    assert.equal(travis.type, 'travis');
    assert.ok(travis.steps.length >= 3);
    assert.ok(travis.defaultBpm > 0);
    assert.equal(travis.cue.kind, 'travis');

    const perc = getLessonDrill('percussive');
    assert.ok(perc.cue.beats.includes('X'));

    const capo = getLessonDrill('capo');
    assert.equal(capo.cue.kind, 'capo');
    assert.equal(capo.cue.soundingChord, 'A');
    assert.match(capo.cue.display, /Capo 2/);
  });

  it('clamps and advances step indices', () => {
    assert.equal(clampStepIndex(-1, 4), 0);
    assert.equal(clampStepIndex(99, 4), 3);
    assert.equal(nextStepIndex(0, 4), 1);
    assert.equal(nextStepIndex(3, 4), 3);
    assert.equal(prevStepIndex(0, 4), 0);
  });

  it('computes progress', () => {
    assert.equal(progressPercent([0, 1], 4), 50);
    assert.equal(allStepsComplete([0, 1, 2, 3], 4), true);
    assert.equal(allStepsComplete([0, 1], 4), false);
  });

  it('msPerBeat respects BPM', () => {
    assert.equal(msPerBeat(60), 1000);
    assert.equal(msPerBeat(120), 500);
  });
});

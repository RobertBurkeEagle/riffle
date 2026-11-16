import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  transposeChord,
  transposeProgression,
  clampTranspose,
  TRANSPOSE_MIN,
  TRANSPOSE_MAX
} from '../../src/domain/transpose.js';

describe('transpose', () => {
  it('transposes roots and keeps suffixes', () => {
    assert.equal(transposeChord('C', 2), 'D');
    assert.equal(transposeChord('Fmaj7', 1), 'F#maj7');
    assert.equal(transposeChord('Am', -2), 'Gm');
    assert.equal(transposeChord('Bb', 2), 'C');
  });

  it('clamps outside safe range', () => {
    assert.deepEqual(clampTranspose(20), { value: TRANSPOSE_MAX, clamped: true });
    assert.deepEqual(clampTranspose(-20), { value: TRANSPOSE_MIN, clamped: true });
    assert.deepEqual(clampTranspose(2), { value: 2, clamped: false });
  });

  it('maps progressions', () => {
    assert.deepEqual(transposeProgression(['G', 'C', 'D'], 2), ['A', 'D', 'E']);
  });
});

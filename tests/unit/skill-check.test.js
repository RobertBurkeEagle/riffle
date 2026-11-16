import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { skillLevelFromScore, scoreSkillAnswers, SKILL_QUESTIONS } from '../../src/domain/skill-check.js';

describe('skill-check', () => {
  it('has three questions', () => {
    assert.equal(SKILL_QUESTIONS.length, 3);
  });

  it('maps thresholds', () => {
    assert.equal(skillLevelFromScore(0), 'beginner');
    assert.equal(skillLevelFromScore(2), 'beginner');
    assert.equal(skillLevelFromScore(3), 'intermediate');
    assert.equal(skillLevelFromScore(4), 'intermediate');
    assert.equal(skillLevelFromScore(5), 'advanced');
    assert.equal(skillLevelFromScore(6), 'advanced');
  });

  it('scores answer arrays', () => {
    assert.deepEqual(scoreSkillAnswers([2, 2, 2]), { total: 6, level: 'advanced' });
    assert.deepEqual(scoreSkillAnswers([1, 1, 1]), { total: 3, level: 'intermediate' });
  });
});

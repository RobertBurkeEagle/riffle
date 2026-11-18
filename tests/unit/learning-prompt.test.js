import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLearningPrompt,
  applyLearningPrompt,
  shouldAutoRefreshPrompt,
  promptInputsHash,
  ADAPTATION_OFF_TEXT
} from '../../src/domain/learning-prompt.js';

function baseProfile(overrides = {}) {
  return {
    skillLevel: 'intermediate',
    genres: ['rock-alt'],
    preferences: { continuousAiAdaptation: true },
    practiceHistory: [],
    roadmap: null,
    learningPrompt: '',
    learningPromptMeta: null,
    ...overrides
  };
}

describe('learning-prompt', () => {
  it('builds template prompt when adaptation is on', () => {
    const result = buildLearningPrompt(baseProfile());
    assert.equal(result.source, 'template');
    assert.match(result.text, /intermediate-level/);
    assert.match(result.text, /Rock & Alternative/);
    assert.match(result.text, /Guidance generated/);
  });

  it('returns off text when adaptation is off', () => {
    const result = buildLearningPrompt(
      baseProfile({ preferences: { continuousAiAdaptation: false } })
    );
    assert.equal(result.source, 'off');
    assert.equal(result.text, ADAPTATION_OFF_TEXT);
  });

  it('force regenerates even when adaptation is off', () => {
    const result = buildLearningPrompt(
      baseProfile({ preferences: { continuousAiAdaptation: false } }),
      { force: true }
    );
    assert.equal(result.source, 'template');
    assert.match(result.text, /intermediate-level/);
  });

  it('detects input changes for auto-refresh', () => {
    const profile = baseProfile();
    applyLearningPrompt(profile);
    assert.equal(shouldAutoRefreshPrompt(profile), false);
    profile.practiceHistory.push({
      type: 'lesson',
      summary: 'Core Shape Review',
      at: new Date().toISOString()
    });
    assert.equal(shouldAutoRefreshPrompt(profile), true);
    assert.notEqual(promptInputsHash(profile), profile.learningPromptMeta.inputsHash);
  });
});

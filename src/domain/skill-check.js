/** @typedef {'beginner' | 'intermediate' | 'advanced'} SkillLevel */

export const SKILL_QUESTIONS = [
  {
    prompt: 'How comfortable are you with open chords (G, C, D, Em, Am)?',
    options: [
      { label: 'Still learning them', score: 0 },
      { label: 'I can switch most of them', score: 1 },
      { label: 'They are automatic', score: 2 }
    ]
  },
  {
    prompt: 'Can you keep time while strumming a full song?',
    options: [
      { label: 'Not yet', score: 0 },
      { label: 'With a metronome or recording', score: 1 },
      { label: 'Yes, steadily', score: 2 }
    ]
  },
  {
    prompt: 'Have you tried fingerpicking or barre chords?',
    options: [
      { label: 'Neither yet', score: 0 },
      { label: 'A little of one', score: 1 },
      { label: 'Both regularly', score: 2 }
    ]
  }
];

/**
 * Map summed question scores (each 0–2) to a skill level.
 * Thresholds: 0–2 beginner, 3–4 intermediate, 5+ advanced.
 * @param {number} totalScore
 * @returns {SkillLevel}
 */
export function skillLevelFromScore(totalScore) {
  const score = Number(totalScore) || 0;
  if (score >= 5) return 'advanced';
  if (score >= 3) return 'intermediate';
  return 'beginner';
}

/**
 * @param {number[]} answerScores
 * @returns {{ total: number, level: SkillLevel }}
 */
export function scoreSkillAnswers(answerScores) {
  const total = (answerScores || []).reduce((sum, n) => sum + (Number(n) || 0), 0);
  return { total, level: skillLevelFromScore(total) };
}

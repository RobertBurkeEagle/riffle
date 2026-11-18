import { GENRE_LABELS } from './roadmap.js';

const ADAPTATION_OFF_TEXT = 'Continuous AI Adaptation is off.';
const GUIDANCE_FOOTER =
  'Guidance generated from this profile — not authoritative instruction from a teacher.';

/**
 * Stable hash of prompt inputs for change detection.
 * @param {object} profile
 */
export function promptInputsHash(profile) {
  const payload = {
    skill: profile?.skillLevel || null,
    genres: [...(profile?.genres || [])].sort(),
    adaptation: !!profile?.preferences?.continuousAiAdaptation,
    recent: (profile?.practiceHistory || []).slice(-5).map((e) => ({
      t: e.type,
      s: e.summary || e.label,
      a: e.at
    })),
    roadmap: profile?.roadmap?.title || null
  };
  return simpleHash(JSON.stringify(payload));
}

function simpleHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

/**
 * Build learning prompt text + metadata from profile.
 * @param {object} profile
 * @param {{ force?: boolean }} [opts] force regenerate even when adaptation is off
 * @returns {{ text: string, generatedAt: string, inputsHash: string, source: 'template' | 'off' }}
 */
export function buildLearningPrompt(profile, opts = {}) {
  const generatedAt = new Date().toISOString();
  const inputsHash = promptInputsHash(profile);
  const adaptationOn = !!profile?.preferences?.continuousAiAdaptation;

  if (!adaptationOn && !opts.force) {
    return {
      text: ADAPTATION_OFF_TEXT,
      generatedAt,
      inputsHash,
      source: 'off'
    };
  }

  const genres =
    (profile?.genres || []).map((g) => GENRE_LABELS[g] || g).join(', ') || 'unspecified';
  const recent =
    (profile?.practiceHistory || [])
      .slice(-5)
      .map((e) => `- ${e.summary || e.label} (${e.at})`)
      .join('\n') || '- No practice logged yet';
  const roadmapLine = profile?.roadmap?.title
    ? `Active roadmap: ${profile.roadmap.title}.`
    : 'No roadmap generated yet.';

  const text = [
    `You are coaching a ${profile?.skillLevel || 'unspecified'}-level guitarist.`,
    `Target genres: ${genres}.`,
    roadmapLine,
    `Focus on incremental drills tied to their roadmap and chord bank.`,
    `Recent practice:`,
    recent,
    '',
    GUIDANCE_FOOTER
  ].join('\n');

  return {
    text,
    generatedAt,
    inputsHash,
    source: 'template'
  };
}

/**
 * Apply prompt build onto profile fields (mutates a shallow copy pattern — caller assigns).
 * @param {object} profile
 * @param {{ force?: boolean }} [opts]
 */
export function applyLearningPrompt(profile, opts = {}) {
  if (!profile) return profile;
  const result = buildLearningPrompt(profile, opts);
  profile.learningPrompt = result.text;
  profile.learningPromptMeta = {
    generatedAt: result.generatedAt,
    inputsHash: result.inputsHash,
    source: result.source
  };
  return profile;
}

/**
 * Whether auto-refresh should rewrite the prompt (adaptation on + inputs changed).
 * @param {object} profile
 */
export function shouldAutoRefreshPrompt(profile) {
  if (!profile?.preferences?.continuousAiAdaptation) return false;
  const next = promptInputsHash(profile);
  return next !== profile?.learningPromptMeta?.inputsHash;
}

export { ADAPTATION_OFF_TEXT, GUIDANCE_FOOTER };

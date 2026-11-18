import { clampTranspose, transposeProgression } from './transpose.js';

/** @typedef {'easy' | 'standard' | 'challenge'} Difficulty */
/** @typedef {'chord' | 'strum'} ExerciseMode */
/** @typedef {'beginner' | 'intermediate' | 'advanced'} SkillLevel */

export const LESSON_CONTENT = {
  travis: {
    steps: [
      'Plant your thumb on the bass strings (E–A–D).',
      'Alternate bass notes while keeping the pulse even.',
      'Add index/middle pinches on the treble strings.',
      'Slow the pattern to 60 BPM, then raise tempo.'
    ]
  },
  percussive: {
    steps: [
      'Mute the strings with your fretting hand.',
      'Strike the body or muted strings on beats 2 and 4.',
      'Combine a downstroke with a palm slap.',
      'Apply the groove to a two-chord loop.'
    ]
  },
  capo: {
    steps: [
      'Place the capo behind a fret without buzzing.',
      'Play an open G shape with capo on 2 (sounds as A).',
      'Rewrite a song chart using the capo key.',
      'Practice moving the capo and renaming chord shapes.'
    ]
  },
  chords: {
    steps: [
      'Review each chord shape slowly.',
      'Switch between two chords for four bars each.',
      'Add a simple downstroke strum.',
      'Loop the progression for two minutes.'
    ]
  },
  strum: {
    steps: [
      'Count 1 & 2 & 3 & 4 & out loud.',
      'Play downstrokes on the beat only.',
      'Add upstrokes on the off-beats.',
      'Lock the pattern to a metronome.'
    ]
  }
};

const CHORD_PRESETS = {
  easy: {
    beginner: ['G', 'Em'],
    intermediate: ['G', 'C', 'D'],
    advanced: ['Am', 'Fmaj7']
  },
  standard: {
    beginner: ['G', 'C', 'D', 'Em'],
    intermediate: ['Fmaj7', 'E7'],
    advanced: ['Dm7', 'G7', 'Cmaj7']
  },
  challenge: {
    beginner: ['G', 'C', 'D', 'Em', 'Am'],
    intermediate: ['Fmaj7', 'E7', 'Am', 'Dm'],
    advanced: ['Bm7b5', 'E7b9', 'Am9']
  }
};

const STRUM_PRESETS = {
  easy: { pattern: 'D - D - D - D -', bpm: 70, label: 'Downstrokes on the beat' },
  standard: { pattern: 'D D U U D U', bpm: 85, label: 'Basic folk/rock groove' },
  challenge: { pattern: 'D X U X D U X U', bpm: 100, label: 'Muted syncopation' }
};

/**
 * @param {SkillLevel | null | undefined} skill
 * @returns {Difficulty}
 */
export function defaultDifficultyForSkill(skill) {
  if (skill === 'advanced') return 'challenge';
  if (skill === 'intermediate') return 'standard';
  return 'easy';
}

/**
 * @param {{ mode: ExerciseMode, difficulty: Difficulty, skillLevel?: SkillLevel | null, transpose?: number }} opts
 */
export function buildExerciseSession({ mode, difficulty, skillLevel = 'beginner', transpose = 0 }) {
  const skill = skillLevel || 'beginner';
  const { value: transposeOffset, clamped } = clampTranspose(transpose);

  if (mode === 'strum') {
    const preset = STRUM_PRESETS[difficulty] || STRUM_PRESETS.standard;
    return {
      mode: 'strum',
      difficulty,
      transpose: transposeOffset,
      transposeClamped: clamped,
      pattern: preset.pattern,
      bpm: preset.bpm,
      label: preset.label,
      chordProgression: [],
      summary: `${preset.label}: ${preset.pattern} @ ${preset.bpm} BPM`
    };
  }

  const pool = CHORD_PRESETS[difficulty] || CHORD_PRESETS.standard;
  const base = pool[skill] || pool.beginner;
  const chordProgression = transposeProgression(base, transposeOffset);
  return {
    mode: 'chord',
    difficulty,
    transpose: transposeOffset,
    transposeClamped: clamped,
    chordProgression,
    bpm: difficulty === 'easy' ? 70 : difficulty === 'challenge' ? 100 : 85,
    pattern: null,
    label: 'Chord transition drill',
    summary: chordProgression.join(' → ')
  };
}

export const PRACTICE_HISTORY_CAP = 100;

/**
 * @param {object[]} history
 * @param {{ type: string, summary: string, meta?: object }} event
 */
export function appendPracticeEvent(history, event) {
  const list = Array.isArray(history) ? [...history] : [];
  list.push({
    id: 'pe_' + Math.random().toString(36).slice(2, 10),
    type: event.type,
    summary: event.summary,
    label: event.summary,
    at: new Date().toISOString(),
    meta: event.meta || {}
  });
  if (list.length > PRACTICE_HISTORY_CAP) {
    return list.slice(list.length - PRACTICE_HISTORY_CAP);
  }
  return list;
}

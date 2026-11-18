import { LESSON_CONTENT } from './exercises.js';
import { transposeChord } from './transpose.js';

/** @typedef {'travis' | 'percussive' | 'capo' | 'chords' | 'strum'} LessonType */

const DRILL_META = {
  travis: {
    defaultBpm: 72,
    label: 'Travis picking',
    cueKind: 'travis',
    patternLabel: 'Thumb (bass) · Pinch (treble)',
    beatPattern: ['T', 'P', 'T', 'P']
  },
  percussive: {
    defaultBpm: 80,
    label: 'Percussive strumming',
    cueKind: 'beats',
    patternLabel: 'Muted hits on 2 & 4',
    beatPattern: ['↓', 'X', '↓', 'X']
  },
  capo: {
    defaultBpm: 70,
    label: 'Capo transposition',
    cueKind: 'capo',
    patternLabel: 'Shape → sounding key',
    capoFret: 2,
    shapeChord: 'G',
    beatPattern: null
  },
  chords: {
    defaultBpm: 75,
    label: 'Chord fluency',
    cueKind: 'chords',
    patternLabel: 'Shape review',
    beatPattern: ['G', 'C', 'D', 'Em']
  },
  strum: {
    defaultBpm: 85,
    label: 'Strumming groove',
    cueKind: 'strum',
    patternLabel: 'D = down · U = up',
    beatPattern: ['D', 'D', 'U', 'U', 'D', 'U']
  }
};

/**
 * @param {string} type
 * @returns {{ steps: string[], cue: object, defaultBpm: number, label: string }}
 */
export function getLessonDrill(type) {
  const key = DRILL_META[type] ? type : 'chords';
  const content = LESSON_CONTENT[key] || LESSON_CONTENT.chords;
  const meta = DRILL_META[key];
  const cue = buildCue(key, meta);
  return {
    type: key,
    steps: [...content.steps],
    defaultBpm: meta.defaultBpm,
    label: meta.label,
    cue
  };
}

/**
 * @param {string} type
 * @param {object} meta
 */
function buildCue(type, meta) {
  if (type === 'capo') {
    const sounding = transposeChord(meta.shapeChord, meta.capoFret);
    return {
      kind: 'capo',
      patternLabel: meta.patternLabel,
      capoFret: meta.capoFret,
      shapeChord: meta.shapeChord,
      soundingChord: sounding,
      display: `Capo ${meta.capoFret} · ${meta.shapeChord} shape → sounds as ${sounding}`
    };
  }
  return {
    kind: meta.cueKind,
    patternLabel: meta.patternLabel,
    beats: meta.beatPattern || [],
    display: meta.patternLabel
  };
}

/**
 * @param {number} currentIndex
 * @param {number} stepCount
 * @returns {number} clamped index
 */
export function clampStepIndex(currentIndex, stepCount) {
  if (!stepCount || stepCount < 1) return 0;
  return Math.max(0, Math.min(stepCount - 1, Number(currentIndex) || 0));
}

/**
 * @param {number} currentIndex
 * @param {number} stepCount
 * @returns {number}
 */
export function nextStepIndex(currentIndex, stepCount) {
  return clampStepIndex((Number(currentIndex) || 0) + 1, stepCount);
}

/**
 * @param {number} currentIndex
 * @param {number} stepCount
 * @returns {number}
 */
export function prevStepIndex(currentIndex, stepCount) {
  return clampStepIndex((Number(currentIndex) || 0) - 1, stepCount);
}

/**
 * @param {number[]} stepsDone
 * @param {number} stepCount
 * @returns {number} 0–100
 */
export function progressPercent(stepsDone, stepCount) {
  if (!stepCount) return 0;
  const unique = new Set(stepsDone || []);
  const done = [...unique].filter((i) => i >= 0 && i < stepCount).length;
  return Math.round((done / stepCount) * 100);
}

/**
 * @param {number[]} stepsDone
 * @param {number} stepCount
 */
export function allStepsComplete(stepsDone, stepCount) {
  if (!stepCount) return false;
  const set = new Set(stepsDone || []);
  for (let i = 0; i < stepCount; i++) {
    if (!set.has(i)) return false;
  }
  return true;
}

/**
 * ms per beat at BPM (quarter note).
 * @param {number} bpm
 */
export function msPerBeat(bpm) {
  const n = Number(bpm) || 60;
  return Math.round(60000 / Math.max(30, Math.min(200, n)));
}

export const TRANSPOSE_MIN = -6;
export const TRANSPOSE_MAX = 6;

const NOTE_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const ENHARMONIC = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  'C#': 'C#',
  'D#': 'D#',
  'F#': 'F#',
  'G#': 'G#',
  'A#': 'A#'
};

/**
 * @param {number} semitones
 * @returns {{ value: number, clamped: boolean }}
 */
export function clampTranspose(semitones) {
  const n = Number(semitones) || 0;
  const value = Math.max(TRANSPOSE_MIN, Math.min(TRANSPOSE_MAX, n));
  return { value, clamped: value !== n };
}

/**
 * @param {string} root
 * @returns {number | null} index in sharp chromatic scale
 */
function rootIndex(root) {
  if (!root) return null;
  const normalized = ENHARMONIC[root] || root;
  const sharpIdx = NOTE_SHARPS.indexOf(normalized);
  if (sharpIdx >= 0) return sharpIdx;
  const flatIdx = NOTE_FLATS.indexOf(root);
  return flatIdx >= 0 ? flatIdx : null;
}

/**
 * Transpose a chord symbol by semitones (e.g. Fmaj7, Am, Bb).
 * @param {string} symbol
 * @param {number} semitones
 * @returns {string}
 */
export function transposeChord(symbol, semitones) {
  if (!symbol || typeof symbol !== 'string') return symbol;
  const { value: steps } = clampTranspose(semitones);
  if (steps === 0) return symbol;

  const match = symbol.trim().match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return symbol;

  const [, root, suffix] = match;
  const idx = rootIndex(root);
  if (idx === null) return symbol;

  const preferFlats = root.includes('b');
  const scale = preferFlats ? NOTE_FLATS : NOTE_SHARPS;
  const next = scale[(idx + steps + 120) % 12];
  return next + suffix;
}

/**
 * @param {string[]} chords
 * @param {number} semitones
 * @returns {string[]}
 */
export function transposeProgression(chords, semitones) {
  return (chords || []).map((c) => transposeChord(c, semitones));
}

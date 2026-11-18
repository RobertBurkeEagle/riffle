import { state, session, currentDoc, SKILL_LABELS, GENRE_LABELS } from '../../backend/state.js';
import { persist } from '../../backend/store.js';
import { switchView } from './shell.js';

var lucide = window.lucide;
var SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
var PITCHES = {
    C: 0, 'B#': 0,
    'C#': 1, Db: 1,
    D: 2,
    'D#': 3, Eb: 3,
    E: 4, Fb: 4,
    F: 5, 'E#': 5,
    'F#': 6, Gb: 6,
    G: 7,
    'G#': 8, Ab: 8,
    A: 9,
    'A#': 10, Bb: 10,
    B: 11, Cb: 11
};

export function noteOf(symbol) {
    var match = String(symbol || '').match(/^([A-G])(#|b)?$/i);
    if (!match) return '';
    return match[1].toUpperCase() + (match[2] || '');
}

export function splitChord(symbol) {
    var match = String(symbol || '').match(/^([A-G])(#|b)?([\s\S]*)$/);
    if (!match || PITCHES[match[1].toUpperCase() + (match[2] || '')] === undefined) return null;
    var rest = match[3];
    var slash = rest.indexOf('/');
    return {
        root: match[1].toUpperCase() + (match[2] || ''),
        quality: slash === -1 ? rest : rest.slice(0, slash),
        bass: slash === -1 ? '' : rest.slice(slash + 1)
    };
}

export function preferFlats(chords, steps) {
    var flats = 0;
    var sharps = 0;
    (chords || []).forEach(function (symbol) {
        var parsed = splitChord(symbol);
        if (!parsed) return;
        [parsed.root, noteOf(parsed.bass)].forEach(function (note) {
            if (!note) return;
            if (note.charAt(1) === 'b') flats += 1;
            if (note.charAt(1) === '#') sharps += 1;
        });
    });
    if (flats !== sharps) return flats > sharps;
    return steps < 0;
}

export function transposeChord(symbol, steps, flat) {
    var parsed = splitChord(symbol);
    if (!parsed || !steps) return symbol;
    var names = flat ? FLAT_NOTES : SHARP_NOTES;
    function spell(note) {
        var name = noteOf(note);
        if (!name || PITCHES[name] === undefined) return note;
        return names[(PITCHES[name] + steps + 120) % 12];
    }
    var bass = parsed.bass ? spell(parsed.bass) : '';
    return spell(parsed.root) + parsed.quality + (bass ? '/' + bass : '');
}

export function drillSelection(source, difficulty) {
    var chords = (source || []).slice();
    if (difficulty === 'easy') chords = chords.slice(0, 2);
    return {
        chords: chords,
        beats: difficulty === 'hard' ? 2 : 4
    };
}

export function transposeLabel(steps) {
    if (!steps) return 'Original key';
    var count = Math.abs(steps);
    var unit = count === 1 ? 'semitone' : 'semitones';
    return (steps > 0 ? 'Up ' : 'Down ') + count + ' ' + unit;
}

var NAMED_DRILLS = { 'alternate-picking': true, 'strum-4': true, 'g-bm': true };
var PATTERN_FOUR = ['D', '·', 'D', 'U', '·', 'U', 'D', 'U'];

export function coachingNote(chords, beats, song, drill) {
    var from = chords[0] || '';
    var to = chords[1] || '';
    if (drill === 'alternate-picking') {
        if ((state.practice.difficulty || 'medium') === 'hard') return 'Cross to the next string on every stroke. Down, then up, and keep the pick moving.';
        return 'Alternate every stroke. Down on the beat, up on the offbeat, and let the pick swing through.';
    }
    if (drill === 'strum-4') {
        if (chords.length > 8) return 'Play pattern #4 twice. Keep the arm moving through every rest.';
        if (chords.indexOf('·') !== -1) return 'Pattern #4 is down, rest, down-up, rest, up, down-up. Keep the arm moving through every rest.';
        return 'These are the sounded strums of pattern #4: down, down, up, up, down, up.';
    }
    if (drill === 'g-bm' && from === 'G' && to === 'Bm') {
        return 'Block change: keep the middle and ring fingers planted, slide them up one fret, and barre with the index finger for B minor.';
    }
    if (chords.length === 2 && from === 'Fmaj7' && to === 'E7') {
        return 'Keep your index finger anchored on the first fret to make this transition smoother.';
    }
    if (chords.length <= 2) {
        return 'Set ' + from + ' cleanly, then move to ' + to + '. Hold each chord for ' + beats + ' beats.';
    }
    var where = song ? ' in ' + song : '';
    return 'Play each change' + where + '. Hold every chord for ' + beats + ' beats.';
}

function drillId() {
    return NAMED_DRILLS[state.practice.drill] ? state.practice.drill : '';
}

function songSource() {
    var practice = state.practice;
    if (practice.source && practice.source.length) return practice.source.slice();
    return [practice.from, practice.to].filter(Boolean);
}

function chordExercise(source, difficulty, steps) {
    var flat = preferFlats(source, steps);
    var selected = drillSelection(source, difficulty);
    return {
        symbols: selected.chords.map(function (chord) { return transposeChord(chord, steps, flat); }),
        labels: selected.chords.map(function () { return selected.beats + (selected.beats === 1 ? ' beat' : ' beats'); }),
        beats: selected.beats,
        steps: steps
    };
}

export function exerciseModel() {
    var practice = state.practice;
    var id = drillId();
    var difficulty = practice.difficulty || 'medium';
    var steps = practice.transpose || 0;
    if (id === 'alternate-picking') {
        var picks = difficulty === 'easy'
            ? ['D', 'U', 'D', 'U']
            : ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'];
        var strings = difficulty === 'hard' ? ['1', '2', '3', '4', '3', '2', '1', '2'] : [];
        return {
            id: id,
            page: 'Alternate Picking',
            lead: 'Acoustic Pop roadmap · 10 minutes.',
            card: 'Alternate Picking',
            symbols: picks,
            labels: picks.map(function (_, index) { return strings[index] ? 'string ' + strings[index] : 'pick'; }),
            beats: 1,
            eighths: true,
            transpose: false,
            strumCard: false,
            linked: false,
            song: ''
        };
    }
    if (id === 'strum-4') {
        var pattern = difficulty === 'easy' ? ['D', 'D', 'U', 'U', 'D', 'U'] : PATTERN_FOUR.slice();
        if (difficulty === 'hard') pattern = pattern.concat(PATTERN_FOUR);
        return {
            id: id,
            page: 'Strumming Pattern #4',
            lead: 'Focus on syncopation consistency.',
            card: 'Strumming Pattern #4',
            symbols: pattern,
            labels: pattern.map(function (stroke) { return stroke === '·' ? 'rest' : 'strum'; }),
            beats: 1,
            eighths: true,
            transpose: false,
            strumCard: false,
            linked: false,
            song: ''
        };
    }
    if (id === 'g-bm') {
        var block = chordExercise(['G', 'Bm'], difficulty, steps);
        return {
            id: id,
            page: 'G to B minor',
            lead: 'G major to B minor block changes.',
            card: 'G to B minor',
            symbols: block.symbols,
            labels: block.labels,
            beats: block.beats,
            eighths: false,
            transpose: true,
            strumCard: false,
            linked: false,
            song: '',
            steps: block.steps
        };
    }
    var song = chordExercise(songSource(), difficulty, steps);
    return {
        id: '',
        page: 'Practice Room',
        lead: 'Targeted drills based on your recent activity.',
        card: 'Chord Transition Drill',
        symbols: song.symbols,
        labels: song.labels,
        beats: song.beats,
        eighths: false,
        transpose: true,
        strumCard: true,
        linked: true,
        song: practice.song || '',
        steps: song.steps
    };
}

export function renderDrill() {
    var practice = state.practice;
    var model = exerciseModel();
    if (model.linked) {
        practice.from = model.symbols[0] || '';
        practice.to = model.symbols[1] || model.symbols[0] || '';
    }

    var list = document.getElementById('drill-changes');
    list.innerHTML = '';
    var size = model.symbols.length > 8 ? ' text-2xl' : model.symbols.length > 3 ? ' text-3xl' : ' text-5xl';
    model.symbols.forEach(function (symbol, index) {
        if (index > 0 && model.linked) {
            var arrow = document.createElement('div');
            arrow.className = 'flex text-app-accent';
            arrow.innerHTML = '<i data-lucide="chevron-right" class="w-6 h-6"></i>' + (model.symbols.length === 2 ? '<i data-lucide="chevron-right" class="w-6 h-6"></i>' : '');
            list.appendChild(arrow);
        }
        var item = document.createElement('div');
        item.className = 'text-center';
        item.dataset.chordStep = String(index);
        var name = document.createElement('div');
        name.dataset.chordName = 'true';
        name.className = 'font-bold font-serif mb-2 text-app-muted' + size;
        name.textContent = symbol;
        var count = document.createElement('div');
        count.dataset.beatRow = 'true';
        count.dataset.idleLabel = model.labels[index] || '';
        count.className = 'text-xs text-app-muted';
        count.textContent = count.dataset.idleLabel;
        item.appendChild(name);
        item.appendChild(count);
        list.appendChild(item);
    });
    chordIndex = 0;
    beatInChord = 0;
    nextBeatAt = 0;
    beatGeneration += 1;
    paintBeat(0, -1);

    document.getElementById('practice-heading').textContent = model.page;
    document.getElementById('practice-lead').textContent = model.lead;
    document.getElementById('drill-heading').textContent = model.card;
    document.getElementById('coaching-note').textContent = coachingNote(model.symbols, model.beats, model.song, model.id);
    var song = document.getElementById('drill-song');
    song.textContent = model.song;
    song.classList.toggle('hidden', !model.song);
    document.getElementById('transpose-control').classList.toggle('hidden', !model.transpose);
    document.getElementById('strum-card').classList.toggle('hidden', !model.strumCard);
    var transposeSteps = model.steps || 0;
    document.getElementById('transpose-label').textContent = transposeLabel(transposeSteps);
    document.getElementById('transpose-down').disabled = transposeSteps <= -6;
    document.getElementById('transpose-up').disabled = transposeSteps >= 6;
    document.querySelectorAll('[data-difficulty]').forEach(function (button) {
        var on = button.dataset.difficulty === (practice.difficulty || 'medium');
        button.setAttribute('aria-checked', on ? 'true' : 'false');
        button.className = on
            ? 'px-3 py-1.5 text-sm bg-app-accent text-white'
            : 'px-3 py-1.5 text-sm text-app-muted hover:text-app-text';
    });
    if (lucide) lucide.createIcons();
}

export function startDrill(id) {
    if (!NAMED_DRILLS[id]) return;
    state.practice.drill = id;
    document.getElementById('practice-message').textContent = '';
    renderDrill();
    persist();
    switchView('practice');
}

export function showPracticeRoom() {
    state.practice.drill = '';
    renderDrill();
    switchView('practice');
}

export function setDifficulty(level) {
    if (level !== 'easy' && level !== 'medium' && level !== 'hard') return;
    state.practice.difficulty = level;
    renderDrill();
    persist();
}

export function stepTranspose(delta) {
    if (!exerciseModel().transpose) return;
    var next = (state.practice.transpose || 0) + delta;
    if (next < -6 || next > 6) return;
    state.practice.transpose = next;
    renderDrill();
    persist();
}

export function generateExercises() {
    var doc = currentDoc();
    if (!doc || doc.detectedChords.length < 2) return;
    state.practice.drill = '';
    state.practice.source = doc.detectedChords.slice();
    state.practice.song = doc.filename;
    if (!state.practice.difficulty) state.practice.difficulty = 'medium';
    renderDrill();
    document.getElementById('practice-message').textContent = '';
    persist();
    switchView('practice');
}

var STRUMS = {
    'acoustic-folk': {
        beginner: ['D', 'D', 'D', 'D'],
        intermediate: ['D', 'D', 'U', 'U', 'D', 'U'],
        advanced: ['D', 'D', 'U', 'D', 'U', 'D', 'U']
    },
    'rock-alternative': {
        beginner: ['D', 'D', 'D', 'D'],
        intermediate: ['D', 'D', 'U', 'D', 'U'],
        advanced: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U']
    },
    'jazz-blues': {
        beginner: ['D', 'D', 'D', 'D'],
        intermediate: ['D', 'U', 'D', 'U'],
        advanced: ['D', 'U', 'U', 'D', 'U', 'D', 'U']
    },
    metal: {
        beginner: ['D', 'D', 'D', 'D'],
        intermediate: ['D', 'D', 'D', 'U', 'D', 'D'],
        advanced: ['D', 'D', 'U', 'D', 'D', 'U', 'D', 'D']
    },
    classical: {
        beginner: ['D', 'D', 'D', 'D'],
        intermediate: ['D', 'U', 'D', 'U'],
        advanced: ['D', 'U', 'U', 'D', 'U', 'U']
    }
};

export function strumPattern() {
    var skill = SKILL_LABELS[state.preferences.skillLevel] ? state.preferences.skillLevel : 'intermediate';
    var genre = (state.preferences.genres || []).filter(function (id) { return STRUMS[id]; })[0] || '';
    var strokes = genre ? STRUMS[genre][skill].slice() : ['D', 'D', 'D', 'D'];
    return { genre: genre, skill: skill, strokes: strokes };
}

export function renderStrumPattern() {
    var pattern = strumPattern();
    var summary = document.getElementById('strum-summary');
    summary.textContent = 'Genre: ' + (GENRE_LABELS[pattern.genre] || 'None') + ' | Complexity: ' + (SKILL_LABELS[pattern.skill] || 'Intermediate');
    var row = document.getElementById('strum-pattern');
    row.innerHTML = '';
    pattern.strokes.forEach(function (stroke, index) {
        if (index > 0) {
            var gap = document.createElement('span');
            gap.className = 'text-app-muted';
            gap.textContent = '·';
            row.appendChild(gap);
        }
        var cell = document.createElement('div');
        cell.className = 'flex flex-col items-center';
        var letter = document.createElement('span');
        letter.className = 'text-2xl font-bold mb-2' + (stroke === 'U' ? ' text-app-muted' : '');
        letter.textContent = stroke;
        var icon = document.createElement('i');
        icon.dataset.lucide = stroke === 'U' ? 'arrow-up' : 'arrow-down';
        icon.className = 'w-6 h-6 ' + (stroke === 'U' ? 'text-app-muted' : 'text-app-accent');
        cell.appendChild(letter);
        cell.appendChild(icon);
        row.appendChild(cell);
    });
    if (lucide) lucide.createIcons();
}

export function applyLabelText() {
    var a = state.chordBank[0];
    var b = state.chordBank[1];
    if (a && b) return 'Apply to saved [' + a + '] and [' + b + '] chords';
    if (a) return 'Apply to saved [' + a + '] chords';
    return 'Apply to saved chords';
}

export function refreshApplyLabel() {
    var button = document.getElementById('apply-pattern');
    document.getElementById('apply-label').textContent = applyLabelText();
    button.disabled = state.chordBank.length === 0;
}

export function applyPattern() {
    var targets = state.chordBank.slice(0, 2);
    if (targets.length === 0) return;
    var strokes = strumPattern().strokes;
    targets.forEach(function (symbol) {
        state.applied[symbol] = strokes.slice();
    });
    document.getElementById('practice-message').textContent = 'Pattern applied.';
    persist();
}

export function setBpm(value) {
    state.practice.bpm = value;
    persist();
}

export function setMetronome(on) {
    state.practice.metronomeOn = !!on;
    persist();
    syncMetronome();
}

var audioCtx = null;
var metronomeTimer = null;
var metronomeRunning = false;
var nextBeatAt = 0;
var chordIndex = 0;
var beatInChord = 0;
var clickCount = 0;
var beatGeneration = 0;

function playbackBpm() {
    var bpm = Number(state.practice.bpm);
    if (!isFinite(bpm) || bpm < 40) return 40;
    if (bpm > 240) return 240;
    return bpm;
}

function currentDrill() {
    var model = exerciseModel();
    return {
        count: model.symbols.length,
        beats: model.beats,
        eighths: model.eighths
    };
}

function ensureAudio() {
    var Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return null;
    if (!audioCtx) audioCtx = new Audio();
    return audioCtx;
}

function playClick(time, accent) {
    var ctx = ensureAudio();
    if (!ctx || ctx.state !== 'running') return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = accent ? 1200 : 800;
    gain.gain.setValueAtTime(accent ? 0.22 : 0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
    clickCount += 1;
}

function paintBeat(active, beat) {
    var drill = currentDrill();
    document.querySelectorAll('#drill-changes [data-chord-step]').forEach(function (item) {
        var index = Number(item.dataset.chordStep);
        var on = index === active;
        var name = item.querySelector('[data-chord-name]');
        var row = item.querySelector('[data-beat-row]');
        if (name) {
            name.classList.toggle('text-white', on);
            name.classList.toggle('text-app-muted', !on);
        }
        if (!row) return;
        row.textContent = '';
        if (on && beat >= 0) {
            for (var i = 0; i < drill.beats; i++) {
                var dot = document.createElement('span');
                dot.className = 'inline-block w-1.5 h-1.5 rounded-full mx-0.5 ' + (i <= beat ? 'bg-app-accent' : 'bg-app-border');
                row.appendChild(dot);
            }
            item.setAttribute('aria-current', 'step');
        } else {
            row.textContent = row.dataset.idleLabel || (drill.beats + ' beats');
            item.removeAttribute('aria-current');
        }
    });
}

function pulseIcon() {
    var icon = document.getElementById('metronome-icon');
    if (!icon) return;
    icon.classList.add('text-app-accent');
    icon.classList.remove('text-app-muted');
    setTimeout(function () {
        if (!icon) return;
        icon.classList.remove('text-app-accent');
        icon.classList.add('text-app-muted');
    }, 90);
}

function scheduleBeat(chord, beat, at) {
    var generation = beatGeneration;
    var delay = audioCtx ? Math.max(0, (at - audioCtx.currentTime) * 1000) : 0;
    setTimeout(function () {
        if (!metronomeRunning || generation !== beatGeneration) return;
        paintBeat(chord, beat);
        pulseIcon();
    }, delay);
}

function metronomeTick() {
    if (!metronomeRunning) return;
    var ctx = ensureAudio();
    var now = ctx ? ctx.currentTime : performance.now() / 1000;
    if (!nextBeatAt) nextBeatAt = now + 0.05;
    var drill = currentDrill();
    if (!drill.count) {
        stopMetronome();
        return;
    }
    while (nextBeatAt < now + 0.15) {
        var chord = chordIndex % drill.count;
        var beat = beatInChord;
        if (ctx) playClick(nextBeatAt, drill.eighths ? chord % 2 === 0 : beat === 0);
        scheduleBeat(chord, beat, nextBeatAt);
        beatInChord += 1;
        if (beatInChord >= drill.beats) {
            beatInChord = 0;
            chordIndex = (chordIndex + 1) % drill.count;
        }
        nextBeatAt += 60 / playbackBpm();
    }
    metronomeTimer = setTimeout(metronomeTick, 40);
}

function stopMetronome() {
    metronomeRunning = false;
    beatGeneration += 1;
    clearTimeout(metronomeTimer);
    metronomeTimer = null;
    nextBeatAt = 0;
    chordIndex = 0;
    beatInChord = 0;
    paintBeat(0, -1);
}

function startMetronome() {
    if (metronomeRunning || !currentDrill().count) return;
    var ctx = ensureAudio();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    metronomeRunning = true;
    nextBeatAt = 0;
    metronomeTick();
}

export function syncMetronome() {
    var play = state.practice.metronomeOn && state.viewId === 'practice' && !session.hydrating;
    if (play) startMetronome();
    else stopMetronome();
}

export function metronomeActivity() {
    return { clicks: clickCount, running: metronomeRunning, chord: chordIndex, beat: beatInChord };
}

document.addEventListener('pointerdown', function () {
    var ctx = ensureAudio();
    if (ctx && ctx.state === 'suspended') ctx.resume();
});

document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopMetronome();
    else syncMetronome();
});

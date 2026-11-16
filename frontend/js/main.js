import { session, state, rememberedView, currentDoc } from '../../backend/state.js';
import { loadSaved, writeState } from '../../backend/store.js';
import { switchView, openFullscreen, closeFullscreen } from './shell.js';
import { savePreferences } from './preferences.js';
import { generateRoadmap, openLesson } from './roadmap.js';
import { handleUpload, saveChordBank, updateChordReview, renderRepertoire } from './library.js';
import { renderRecentScans } from './overview.js';
import { generateExercises, applyPattern, setBpm, setMetronome, refreshApplyLabel, renderDrill, renderStrumPattern, setDifficulty, stepTranspose, syncMetronome, startDrill, showPracticeRoom } from './practice.js';
import { applySaved } from './workspace.js';

var lucide = window.lucide;

function bind(id, event, handler) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

lucide.createIcons();

document.querySelectorAll('[data-view]').forEach(function (el) {
    el.addEventListener('click', function () {
        if (el.dataset.view === 'practice') showPracticeRoom();
        else switchView(el.dataset.view);
    });
});
document.querySelectorAll('[data-drill]').forEach(function (el) {
    el.addEventListener('click', function () { startDrill(el.dataset.drill); });
});
bind('save-preferences', 'click', savePreferences);
bind('generate-roadmap', 'click', generateRoadmap);
var lockedLesson = document.querySelector('[data-locked="true"]');
if (lockedLesson) lockedLesson.addEventListener('click', function () { openLesson(lockedLesson); });
bind('upload-input', 'change', handleUpload);
bind('open-fullscreen', 'click', openFullscreen);
bind('close-fullscreen', 'click', closeFullscreen);
bind('save-chords', 'click', saveChordBank);
bind('generate-exercises', 'click', generateExercises);
bind('apply-pattern', 'click', applyPattern);
bind('bpm', 'input', function (event) { setBpm(event.target.value); });
bind('metronome', 'change', function (event) { setMetronome(event.target.checked); });
document.querySelectorAll('[data-difficulty]').forEach(function (button) {
    button.addEventListener('click', function () { setDifficulty(button.dataset.difficulty); });
});
bind('transpose-down', 'click', function () { stepTranspose(-1); });
bind('transpose-up', 'click', function () { stepTranspose(1); });
renderDrill();
renderStrumPattern();
renderRepertoire();
renderRecentScans();
updateChordReview(currentDoc());
refreshApplyLabel();

var startupView = rememberedView();
if (startupView) switchView(startupView);

loadSaved().then(function (saved) {
    if (saved && saved.documents && saved.documents.length) applySaved(saved);
    session.ready = true;
    if (saved && saved.viewId !== state.viewId) writeState();
    syncMetronome();
});

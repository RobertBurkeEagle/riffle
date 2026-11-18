import { state, session, rememberedView, VIEWS, SKILL_LABELS, GENRE_LABELS, currentDoc, libraryFromSaved } from '../../backend/state.js';
import { renderRecentScans } from './overview.js';
import { renderRepertoire, selectDocument, resumeDetection } from './library.js';
import { refreshApplyLabel, renderDrill, renderStrumPattern } from './practice.js';
import { switchView } from './shell.js';

export function applySaved(saved) {
    session.hydrating = true;
    state.viewId = rememberedView() || (VIEWS[saved.viewId] ? saved.viewId : 'dashboard');
    state.selectedId = saved.selectedId || state.selectedId;
    state.preferences = saved.preferences || state.preferences;
    state.preferencesSaved = !!saved.preferencesSaved;
    state.chordBank = saved.chordBank || state.chordBank;
    state.applied = saved.applied || {};
    var savedPractice = saved.practice || {};
    state.practice.bpm = savedPractice.bpm || state.practice.bpm;
    state.practice.metronomeOn = savedPractice.metronomeOn != null ? !!savedPractice.metronomeOn : state.practice.metronomeOn;
    state.practice.from = savedPractice.from || state.practice.from;
    state.practice.to = savedPractice.to || state.practice.to;
    state.practice.source = savedPractice.source && savedPractice.source.length
        ? savedPractice.source.slice()
        : [state.practice.from, state.practice.to].filter(Boolean);
    state.practice.difficulty = savedPractice.difficulty || 'medium';
    state.practice.transpose = savedPractice.transpose || 0;
    state.practice.song = savedPractice.song || '';
    state.practice.drill = savedPractice.drill || '';
    state.roadmapTitle = saved.roadmapTitle || state.roadmapTitle;
    state.documents = libraryFromSaved(saved.documents, saved.recentScans);
    state.documents.forEach(function (doc) {
        if (!doc.fileData) return;
        doc.previewUrl = URL.createObjectURL(new Blob([doc.fileData], {
            type: doc.fileType || (doc.mediaKind === 'pdf' ? 'application/pdf' : 'image/png')
        }));
    });
    var skill = document.querySelector('input[name="skill"][value="' + state.preferences.skillLevel + '"]');
    if (skill) skill.checked = true;
    var genres = state.preferences.genres || [];
    document.querySelectorAll('input[name="genre"]').forEach(function (input) {
        input.checked = genres.indexOf(input.value) !== -1;
    });
    document.getElementById('ai-toggle').checked = !!state.preferences.continuousAiAdaptation;
    document.getElementById('cloud-toggle').checked = !!state.preferences.cloudSync;
    if (state.preferencesSaved) {
        document.getElementById('skill-level').textContent = SKILL_LABELS[state.preferences.skillLevel] || 'Intermediate';
        var labels = genres.map(function (id) { return GENRE_LABELS[id]; }).filter(Boolean);
        document.getElementById('active-genres').textContent = labels.length ? labels.join(', ') : 'None';
    }
    document.getElementById('roadmap-title').textContent = state.roadmapTitle;
    renderRecentScans();
    renderRepertoire();
    if (currentDoc()) selectDocument(state.selectedId);
    renderDrill();
    renderStrumPattern();
    document.getElementById('bpm').value = state.practice.bpm;
    document.getElementById('metronome').checked = !!state.practice.metronomeOn;
    refreshApplyLabel();
    switchView(state.viewId);
    session.hydrating = false;
    resumeDetection();
}

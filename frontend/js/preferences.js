import { state, SKILL_LABELS, GENRE_LABELS } from '../../backend/state.js';
import { persist } from '../../backend/store.js';
import { renderStrumPattern } from './practice.js';

export function savePreferences() {
    var skillInput = document.querySelector('input[name="skill"]:checked');
    var genreInputs = document.querySelectorAll('input[name="genre"]:checked');
    state.preferences.skillLevel = skillInput ? skillInput.value : 'intermediate';
    state.preferences.genres = Array.prototype.map.call(genreInputs, function (input) { return input.value; });
    state.preferences.continuousAiAdaptation = document.getElementById('ai-toggle').checked;
    state.preferences.cloudSync = document.getElementById('cloud-toggle').checked;
    document.getElementById('skill-level').textContent = SKILL_LABELS[state.preferences.skillLevel];
    var labels = state.preferences.genres.map(function (id) { return GENRE_LABELS[id]; });
    document.getElementById('active-genres').textContent = labels.length ? labels.join(', ') : 'None';
    document.getElementById('preferences-status').textContent = 'Preferences saved.';
    state.preferencesSaved = true;
    renderStrumPattern();
    persist();
}

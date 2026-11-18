import { state, GENRE_LABELS } from '../../backend/state.js';
import { persist } from '../../backend/store.js';

export function generateRoadmap() {
    var message = document.getElementById('roadmap-message');
    if (state.preferences.genres.length === 0) {
        message.textContent = 'Choose at least one target genre.';
        return;
    }
    message.textContent = '';
    var genres = state.preferences.genres.slice().sort();
    var isDefault = state.preferences.skillLevel === 'intermediate'
        && genres.length === 2
        && genres[0] === 'acoustic-folk'
        && genres[1] === 'rock-alternative';
    var title = isDefault
        ? 'The Indie Folk Foundation'
        : 'The ' + GENRE_LABELS[state.preferences.genres[0]] + ' Foundation';
    document.getElementById('roadmap-title').textContent = title;
    state.roadmapTitle = title;
    persist();
}

export function openLesson(el) {
    if (el && el.dataset.locked === 'true') return;
}

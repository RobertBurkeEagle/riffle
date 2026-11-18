import { state, session, VIEWS, currentDoc } from '../../backend/state.js';
import { writeState } from '../../backend/store.js';
import { syncMetronome } from './practice.js';

var lucide = window.lucide;

export function switchView(viewId) {
    if (!VIEWS[viewId]) viewId = 'dashboard';
    closeFullscreen();
    document.querySelectorAll('.view-section').forEach(function (el) {
        el.classList.add('hidden');
    });
    var targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.remove('hidden');
    state.viewId = viewId;
    try { sessionStorage.setItem('riffle-view', viewId); } catch (err) {}
    if (session.ready && !session.hydrating) writeState();
    syncMetronome();

    document.querySelectorAll('.nav-link').forEach(function (el) {
        el.classList.remove('text-app-accent', 'bg-[#2A2A2A]');
        el.classList.add('text-app-muted', 'hover:text-app-text', 'hover:bg-[#2A2A2A]');
    });
    var activeNav = document.getElementById('nav-' + viewId);
    if (activeNav) {
        activeNav.classList.remove('text-app-muted', 'hover:text-app-text', 'hover:bg-[#2A2A2A]');
        activeNav.classList.add('text-app-accent', 'bg-[#2A2A2A]');
    }
}

export function openFullscreen() {
    var doc = currentDoc();
    if (!doc) return;
    var preview = document.getElementById('fullscreen-preview');
    preview.innerHTML = document.getElementById('analysis-preview').innerHTML;
    document.getElementById('fullscreen').classList.remove('hidden');
    lucide.createIcons();
}

export function closeFullscreen() {
    var overlay = document.getElementById('fullscreen');
    if (overlay) overlay.classList.add('hidden');
}

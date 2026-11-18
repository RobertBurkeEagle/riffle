import { recentDocuments } from '../../backend/state.js';
import { openLibraryFile } from './library.js';

var lucide = window.lucide;

export function renderRecentScans() {
    var list = document.getElementById('recent-scans');
    list.innerHTML = '';
    recentDocuments().forEach(function (doc) {
        var li = document.createElement('li');
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'flex items-center text-sm w-full text-left hover:text-app-accent';
        button.innerHTML = '<i data-lucide="' + (doc.mediaKind === 'image' ? 'image' : 'file-text') + '" class="w-4 h-4 text-app-muted mr-3"></i><span class="truncate flex-1"></span>';
        button.querySelector('span').textContent = doc.filename;
        button.addEventListener('click', function () { openLibraryFile(doc.id); });
        li.appendChild(button);
        list.appendChild(li);
    });
    lucide.createIcons();
}

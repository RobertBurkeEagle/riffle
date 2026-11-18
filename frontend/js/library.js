import { state, session, currentDoc } from '../../backend/state.js';
import { persist, writeState } from '../../backend/store.js';
import { CHORD_READER_VERSION, chordFromInput, detectChords, isAllowedFile } from '../../backend/chords.js';
import { renderRecentScans } from './overview.js';
import { refreshApplyLabel } from './practice.js';
import { switchView } from './shell.js';

var lucide = window.lucide;

export function paintRepertoire() {
    document.querySelectorAll('#repertoire li').forEach(function (li) {
        var selected = li.dataset.id === state.selectedId;
        li.className = selected
            ? 'p-4 bg-[#2A2A2A] border-l-4 border-app-accent cursor-pointer flex items-center justify-between'
            : 'p-4 hover:bg-[#1A1A1A] cursor-pointer flex items-center justify-between transition-colors';
        var name = li.querySelector('[data-filename]');
        if (name) name.className = selected ? 'font-medium text-sm' : 'font-medium text-sm text-app-muted';
        var chevron = li.querySelector('[data-chevron]');
        if (selected && !chevron) {
            chevron = document.createElement('span');
            chevron.dataset.chevron = 'true';
            chevron.innerHTML = '<i data-lucide="chevron-right" class="w-4 h-4 text-app-muted"></i>';
            li.appendChild(chevron);
        } else if (!selected && chevron) {
            chevron.remove();
        }
    });
    lucide.createIcons();
}

export function renderPreview(doc) {
    var preview = document.getElementById('analysis-preview');
    preview.innerHTML = '';
    if (doc.previewUrl && doc.mediaKind === 'image') {
        var img = document.createElement('img');
        img.src = doc.previewUrl;
        img.alt = doc.filename;
        img.className = 'max-h-full max-w-full object-contain';
        preview.appendChild(img);
        return;
    }
    if (doc.previewUrl && doc.mediaKind === 'pdf') {
        var frame = document.createElement('iframe');
        frame.src = doc.previewUrl;
        frame.title = doc.filename;
        frame.className = 'absolute inset-0 w-full h-full bg-white';
        preview.appendChild(frame);
        return;
    }
    preview.innerHTML = '<div class="text-app-muted flex flex-col items-center"><i data-lucide="file-music" class="w-16 h-16 mb-4 opacity-50"></i><p>Document preview rendered here.</p></div>';
    lucide.createIcons();
}

export function noteRecent(id) {
    if (session.hydrating) return;
    var doc = state.documents.find(function (item) { return item.id === id; });
    if (!doc) return;
    doc.lastOpened = Date.now();
    renderRecentScans();
}

export function openLibraryFile(id) {
    noteRecent(id);
    switchView('library');
    selectDocument(id);
}

export function selectDocument(id) {
    state.selectedId = id;
    paintRepertoire();
    var doc = currentDoc();
    document.getElementById('analysis-filename').textContent = doc.filename;
    var statusRow = document.getElementById('analysis-status-row');
    var statusEl = document.getElementById('analysis-status');
    var statusIcon = document.getElementById('analysis-status-icon');
    var message = document.getElementById('library-message');
    message.textContent = '';
    message.className = 'text-sm text-[#10B981] mb-4';
    if (doc.analyzing) {
        statusEl.textContent = 'Reading chords';
        statusRow.className = 'flex items-center text-app-accent mb-3';
        statusIcon.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2"></i>';
    } else if (!doc.detectedChords.length) {
        statusEl.textContent = 'No chord symbols found';
        statusRow.className = 'flex items-center text-app-muted mb-3';
        statusIcon.innerHTML = '<i data-lucide="circle-alert" class="w-4 h-4 mr-2"></i>';
        message.textContent = 'Riffle reads chord names printed on the page, such as G, Am, and D7.';
        message.className = 'text-sm text-app-muted mb-4';
    } else {
        statusEl.textContent = 'Analysis Complete';
        statusRow.className = 'flex items-center text-[#10B981] mb-3';
        statusIcon.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 mr-2"></i>';
    }
    updateChordReview(doc);
    var icon = document.getElementById('analysis-icon');
    if (icon && icon.setAttribute) icon.setAttribute('data-lucide', doc.mediaKind === 'image' ? 'image' : 'file-text');
    renderPreview(doc);
    lucide.createIcons();
    persist();
}

export function renderRepertoire() {
    var list = document.getElementById('repertoire');
    list.innerHTML = '';
    state.documents.forEach(function (doc) {
        var li = document.createElement('li');
        li.dataset.id = doc.id;
        li.onclick = function () { noteRecent(doc.id); selectDocument(doc.id); };
        var icon = doc.mediaKind === 'image' ? 'image' : 'file-text';
        li.innerHTML = '<div class="flex items-center"><i data-lucide="' + icon + '" class="w-5 h-5 text-app-muted mr-3"></i><span data-filename class="font-medium text-sm"></span></div>';
        li.querySelector('[data-filename]').textContent = doc.filename;
        list.appendChild(li);
    });
    paintRepertoire();
}

export function handleUpload(event) {
    var file = event.target.files && event.target.files[0];
    event.target.value = '';
    var message = document.getElementById('upload-message');
    if (!file) return;
    if (!isAllowedFile(file)) {
        message.textContent = 'Upload a PDF, PNG, or JPG.';
        return;
    }
    message.textContent = '';
    var id = 'upload-' + Date.now();
    var mediaKind = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
    var doc = {
        id: id,
        filename: file.name,
        mediaKind: mediaKind,
        detectedChords: [],
        analyzing: true,
        needsDetect: true,
        fileType: file.type || '',
        fileData: null,
        previewUrl: URL.createObjectURL(file)
    };
    doc.lastOpened = Date.now();
    state.documents.push(doc);
    renderRepertoire();
    renderRecentScans();
    selectDocument(id);
    file.arrayBuffer().then(function (buffer) {
        doc.fileData = buffer;
        writeState();
        return detectChords(file);
    }).then(function (chords) {
        doc.detectedChords = chords;
        doc.analyzing = false;
        doc.needsDetect = false;
        doc.readerVersion = CHORD_READER_VERSION;
        writeState();
        if (state.selectedId === id) selectDocument(id);
    }).catch(function () {
        doc.detectedChords = [];
        doc.analyzing = false;
        doc.needsDetect = false;
        doc.readerVersion = CHORD_READER_VERSION;
        writeState();
        if (state.selectedId === id) {
            selectDocument(id);
            var status = document.getElementById('library-message');
            status.textContent = 'Could not read this file. Try a clearer photo.';
            status.className = 'text-sm text-app-accent mb-4';
        }
    });
}

export function syncChordActions(doc) {
    var count = doc && !doc.analyzing && doc.detectedChords ? doc.detectedChords.length : 0;
    document.getElementById('save-chords').disabled = count === 0;
    document.getElementById('generate-exercises').disabled = count < 2;
}

export function focusChord(index) {
    var button = document.querySelector('#detected-chords [data-chord-index="' + index + '"]');
    if (button) button.focus();
}

var dragFrom = null;
var suppressChordClick = false;

export function renderChordReview(doc) {
    var list = document.getElementById('detected-chords');
    list.innerHTML = '';
    var chords = doc.detectedChords || [];
    chords.forEach(function (chord, index) {
        var item = document.createElement('div');
        item.className = 'chord-chip flex items-center bg-[#2A2A2A] border border-app-border rounded-md';
        item.setAttribute('role', 'listitem');
        item.setAttribute('aria-label', 'Drag to reorder ' + chord);
        item.draggable = true;
        item.dataset.chordPos = String(index);
        item.appendChild(chordGrip(chord));
        item.appendChild(chordNameButton(index, chord));
        item.appendChild(chordDeleteButton(index, chord));
        item.addEventListener('dragstart', onChordDragStart);
        item.addEventListener('dragend', onChordDragEnd);
        list.appendChild(item);
    });
    lucide.createIcons();
}

export function chordGrip(chord) {
    var grip = document.createElement('span');
    grip.className = 'pl-1.5 text-app-muted';
    grip.setAttribute('aria-hidden', 'true');
    grip.innerHTML = '<i data-lucide="grip-vertical" class="w-4 h-4"></i>';
    grip.title = 'Drag to reorder ' + chord;
    return grip;
}

function onChordDragStart(event) {
    if (event.target.closest('[data-chord-delete]') || document.querySelector('#detected-chords input')) {
        event.preventDefault();
        return;
    }
    dragFrom = Number(event.currentTarget.dataset.chordPos);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(dragFrom));
    event.currentTarget.classList.add('is-dragging');
}

function onChordDragEnd(event) {
    dragFrom = null;
    clearDropMarks();
    event.currentTarget.classList.remove('is-dragging');
}

function dropAfter(chip, clientX) {
    var rect = chip.getBoundingClientRect();
    return clientX > rect.left + rect.width / 2;
}

function clearDropMarks() {
    document.querySelectorAll('#detected-chords .chord-chip').forEach(function (chip) {
        chip.classList.remove('is-drop-before', 'is-drop-after');
    });
}

export function chordDeleteButton(index, chord) {
    var button = document.createElement('button');
    button.type = 'button';
    button.dataset.chordDelete = 'true';
    button.draggable = false;
    button.className = 'p-1.5 text-app-muted hover:text-app-text';
    button.setAttribute('aria-label', 'Remove ' + chord);
    button.innerHTML = '<i data-lucide="x" class="w-4 h-4"></i>';
    button.onclick = function () { deleteDetectedChord(index); };
    return button;
}

export function chordNameButton(index, chord) {
    var button = document.createElement('span');
    button.setAttribute('role', 'button');
    button.tabIndex = 0;
    button.dataset.chordIndex = String(index);
    button.className = 'px-1.5 py-1 text-lg font-medium min-w-8';
    button.textContent = chord;
    button.setAttribute('aria-label', 'Edit ' + chord);
    button.addEventListener('click', function () {
        if (suppressChordClick) return;
        beginChordEdit(index, button);
    });
    button.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        beginChordEdit(index, button);
    });
    return button;
}

export function updateChordReview(doc) {
    var hint = document.getElementById('chord-review-hint');
    var show = doc && !doc.analyzing && doc.detectedChords && doc.detectedChords.length > 0;
    if (hint) hint.classList.toggle('hidden', !show);
    if (show) renderChordReview(doc);
    else document.getElementById('detected-chords').innerHTML = '';
    syncChordActions(doc);
}

export function reorderDetectedChord(from, target, after) {
    var doc = currentDoc();
    if (!doc || from === null || from === undefined) return;
    var chords = doc.detectedChords;
    if (from < 0 || from >= chords.length || target < 0 || target >= chords.length) return;
    var insertAt = target + (after ? 1 : 0);
    if (insertAt === from || insertAt === from + 1) return;
    var moved = chords.splice(from, 1)[0];
    if (insertAt > from) insertAt -= 1;
    chords.splice(insertAt, 0, moved);
    renderChordReview(doc);
    persist();
    focusChord(insertAt);
}

export function deleteDetectedChord(index) {
    var doc = currentDoc();
    if (!doc) return;
    doc.detectedChords.splice(index, 1);
    if (!doc.detectedChords.length) {
        var message = document.getElementById('library-message');
        message.textContent = 'No chords left in this list.';
        message.className = 'text-sm text-app-muted mb-4';
    }
    updateChordReview(doc);
    persist();
    if (doc.detectedChords.length) focusChord(Math.min(index, doc.detectedChords.length - 1));
}

export function beginChordEdit(index, button) {
    var open = document.querySelector('#detected-chords input');
    if (open) {
        open.blur();
        button = document.querySelector('#detected-chords [data-chord-index="' + index + '"]');
        if (!button) return;
    }
    var doc = currentDoc();
    if (!doc) return;
    var input = document.createElement('input');
    input.type = 'text';
    input.value = doc.detectedChords[index];
    input.setAttribute('aria-label', 'Chord name');
    input.className = 'mx-1 w-20 bg-transparent text-lg font-medium outline-none border-b border-app-accent';
    button.replaceWith(input);
    input.focus();
    input.select();
    var finished = false;
    function finish(nextChord, restoreFocus) {
        if (finished) return;
        finished = true;
        var message = document.getElementById('library-message');
        if (nextChord) {
            doc.detectedChords[index] = nextChord;
            message.textContent = '';
            message.className = 'text-sm text-[#10B981] mb-4';
            persist();
        } else if (nextChord === '') {
            message.textContent = 'Enter a chord such as G, Am, or D7.';
            message.className = 'text-sm text-app-accent mb-4';
        }
        renderChordReview(doc);
        if (restoreFocus) focusChord(index);
    }
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            finish(chordFromInput(input.value), true);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            finish(null, true);
        }
    });
    input.addEventListener('blur', function (event) {
        var nextEdit = event.relatedTarget && event.relatedTarget.dataset
            ? event.relatedTarget.dataset.chordIndex
            : '';
        finish(chordFromInput(input.value), false);
        if (nextEdit) {
            var fresh = document.querySelector('#detected-chords [data-chord-index="' + nextEdit + '"]');
            if (fresh) beginChordEdit(Number(nextEdit), fresh);
        }
    });
}

export function saveChordBank() {
    var doc = currentDoc();
    if (!doc || doc.detectedChords.length === 0) return;
    doc.detectedChords.forEach(function (symbol) {
        if (state.chordBank.indexOf(symbol) === -1) state.chordBank.push(symbol);
    });
    document.getElementById('library-message').textContent = 'Saved to chord bank.';
    document.getElementById('library-message').className = 'text-sm text-[#10B981] mb-4';
    refreshApplyLabel();
    persist();
}

export function resumeDetection() {
    state.documents.forEach(function (doc) {
        var empty = !doc.detectedChords || !doc.detectedChords.length;
        var stale = doc.readerVersion !== CHORD_READER_VERSION;
        var uploaded = String(doc.id).indexOf('upload-') === 0;
        if (!doc.fileData || !uploaded || (!doc.needsDetect && !empty && !stale)) return;
        doc.analyzing = true;
        doc.needsDetect = true;
        if (state.selectedId === doc.id) selectDocument(doc.id);
        var file = new File([doc.fileData], doc.filename, { type: doc.fileType || '' });
        detectChords(file).then(function (chords) {
            doc.detectedChords = chords;
            doc.analyzing = false;
            doc.needsDetect = false;
            doc.readerVersion = CHORD_READER_VERSION;
            writeState();
            if (state.selectedId === doc.id) selectDocument(doc.id);
        }).catch(function () {
            doc.analyzing = false;
            doc.needsDetect = false;
            doc.readerVersion = CHORD_READER_VERSION;
            writeState();
        });
    });
}

var detectedChords = document.getElementById('detected-chords');

detectedChords.addEventListener('mousedown', function (event) {
    var open = document.querySelector('#detected-chords input');
    if (!open || event.target === open) return;
    open.blur();
});

detectedChords.addEventListener('dragover', function (event) {
    var chip = event.target.closest('.chord-chip');
    if (!chip || dragFrom === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearDropMarks();
    chip.classList.add(dropAfter(chip, event.clientX) ? 'is-drop-after' : 'is-drop-before');
});

detectedChords.addEventListener('drop', function (event) {
    var chip = event.target.closest('.chord-chip');
    if (!chip || dragFrom === null) return;
    event.preventDefault();
    var from = dragFrom;
    clearDropMarks();
    suppressChordClick = true;
    reorderDetectedChord(from, Number(chip.dataset.chordPos), dropAfter(chip, event.clientX));
    setTimeout(function () { suppressChordClick = false; }, 0);
});

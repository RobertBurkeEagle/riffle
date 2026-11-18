export var SKILL_LABELS = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
};

export var GENRE_LABELS = {
    'acoustic-folk': 'Acoustic / Folk',
    'rock-alternative': 'Rock & Alternative',
    'jazz-blues': 'Jazz & Blues',
    metal: 'Metal',
    classical: 'Classical'
};

export var VIEWS = { dashboard: true, profile: true, roadmap: true, library: true, practice: true };

export var session = { hydrating: false, ready: false };

export var SEED_DOCUMENTS = [
    { id: 'blackbird', filename: 'Blackbird.pdf', mediaKind: 'pdf', detectedChords: ['Am', 'C', 'G', 'Fmaj7', 'E7'], lastOpened: 0 },
    { id: 'hotel', filename: 'Hotel_California.pdf', mediaKind: 'pdf', detectedChords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em'], lastOpened: 0 },
    { id: 'unknown', filename: 'Unknown_Song_Scan.jpg', mediaKind: 'image', detectedChords: [], lastOpened: 0 },
    { id: 'wonderwall', filename: 'Wonderwall_Chords.pdf', mediaKind: 'pdf', detectedChords: ['Em7', 'G', 'Dsus4', 'A7sus4'], lastOpened: 2 },
    { id: 'autumn', filename: 'Autumn_Leaves_Lead.png', mediaKind: 'image', detectedChords: ['Am7', 'D7', 'Gmaj7', 'Cmaj7', 'F#m7b5', 'B7', 'Em'], lastOpened: 1 }
];

export function seedDocument(seed) {
    return {
        id: seed.id,
        filename: seed.filename,
        mediaKind: seed.mediaKind,
        detectedChords: seed.detectedChords.slice(),
        previewUrl: '',
        lastOpened: seed.lastOpened || 0
    };
}

export function libraryFromSaved(savedDocs, savedScans) {
    var docs = (savedDocs || []).map(function (doc) {
        return {
            id: doc.id,
            filename: doc.filename,
            mediaKind: doc.mediaKind,
            detectedChords: (doc.detectedChords || []).slice(),
            fileType: doc.fileType || '',
            fileData: doc.fileData || null,
            needsDetect: !!doc.needsDetect,
            readerVersion: doc.readerVersion || 0,
            analyzing: !!doc.needsDetect,
            previewUrl: '',
            lastOpened: doc.lastOpened == null ? null : doc.lastOpened
        };
    });
    var ranked = docs.some(function (doc) { return doc.lastOpened != null; });
    SEED_DOCUMENTS.forEach(function (seed) {
        if (docs.some(function (doc) { return doc.id === seed.id; })) return;
        var created = seedDocument(seed);
        if (!ranked) created.lastOpened = null;
        var uploadAt = docs.findIndex(function (doc) { return String(doc.id).indexOf('upload-') === 0; });
        if (uploadAt === -1) docs.push(created);
        else docs.splice(uploadAt, 0, created);
    });
    if (!ranked) {
        var scans = savedScans || [];
        scans.forEach(function (scan, index) {
            var doc = docs.find(function (item) {
                return item.id === scan.id || item.filename === scan.filename;
            });
            if (doc) doc.lastOpened = scans.length - index;
        });
        docs.forEach(function (doc) {
            if (doc.lastOpened != null) return;
            var seed = SEED_DOCUMENTS.find(function (item) { return item.id === doc.id; });
            doc.lastOpened = seed ? seed.lastOpened : 0;
        });
    }
    return docs;
}

export function recentDocuments() {
    return state.documents.map(function (doc, index) {
        return { doc: doc, index: index };
    }).sort(function (a, b) {
        return (b.doc.lastOpened || 0) - (a.doc.lastOpened || 0) || a.index - b.index;
    }).map(function (item) { return item.doc; });
}

export var state = {
    selectedId: 'blackbird',
    preferences: {
        skillLevel: 'intermediate',
        genres: ['acoustic-folk', 'rock-alternative'],
        continuousAiAdaptation: true,
        cloudSync: true
    },
    chordBank: ['G', 'Cadd9'],
    applied: {},
    practice: {
        bpm: '85',
        metronomeOn: true,
        from: 'Fmaj7',
        to: 'E7',
        source: ['Fmaj7', 'E7'],
        difficulty: 'medium',
        transpose: 0,
        song: ''
    },
    preferencesSaved: false,
    viewId: 'dashboard',
    roadmapTitle: 'The Indie Folk Foundation',
    documents: SEED_DOCUMENTS.map(seedDocument)
};

export function rememberedView() {
    try {
        var viewId = sessionStorage.getItem('riffle-view') || '';
        return VIEWS[viewId] ? viewId : '';
    } catch (err) {
        return '';
    }
}

export function currentDoc() {
    return state.documents.find(function (doc) { return doc.id === state.selectedId; });
}

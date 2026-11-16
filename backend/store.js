import { state, session } from './state.js';

var persistTimer = null;
var persistChain = Promise.resolve();

export function openDb() {
    return new Promise(function (resolve, reject) {
        var request = indexedDB.open('riffle', 1);
        request.onupgradeneeded = function () {
            request.result.createObjectStore('workspace');
        };
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error); };
    });
}

export function workspaceSnapshot() {
    return {
        selectedId: state.selectedId,
        viewId: state.viewId,
        preferencesSaved: state.preferencesSaved,
        preferences: state.preferences,
        chordBank: state.chordBank.slice(),
        applied: state.applied,
        practice: state.practice,
        roadmapTitle: state.roadmapTitle,
        documents: state.documents.map(function (doc) {
            return {
                id: doc.id,
                filename: doc.filename,
                mediaKind: doc.mediaKind,
                detectedChords: (doc.detectedChords || []).slice(),
                fileType: doc.fileType || '',
                fileData: doc.fileData || null,
                needsDetect: !!doc.needsDetect,
                readerVersion: doc.readerVersion || 0,
                lastOpened: doc.lastOpened || 0
            };
        })
    };
}

export function writeState() {
    var record = workspaceSnapshot();
    persistChain = persistChain.then(function () {
        return openDb().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction('workspace', 'readwrite');
                tx.objectStore('workspace').put(record, 'state');
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }).catch(function () {});
}

export function persist() {
    if (session.hydrating) return;
    clearTimeout(persistTimer);
    persistTimer = setTimeout(writeState, 200);
}

export function loadSaved() {
    return openDb().then(function (db) {
        return new Promise(function (resolve) {
            var request = db.transaction('workspace', 'readonly').objectStore('workspace').get('state');
            request.onsuccess = function () { resolve(request.result || null); };
            request.onerror = function () { resolve(null); };
        });
    }).catch(function () { return null; });
}

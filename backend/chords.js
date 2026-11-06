var pdfjsLib = window.pdfjsLib;
var Tesseract = window.Tesseract;

export var CHORD_TOKEN = /^([A-G])(#|b)?(?:maj|min|dim|aug|sus|add|m)?(?:\d{1,2})?(?:(?:#|b)\d{1,2})?(?:sus[24])?(?:add\d{1,2})?(?:\/[A-G](?:#|b)?)?$/i;
export var CHORD_READER_VERSION = 3;
var ocrWorkerPromise = null;

if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export function isAllowedFile(file) {
    var name = file.name.toLowerCase();
    return name.endsWith('.pdf') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
}

export function cleanToken(raw) {
    var token = String(raw || '')
        .replace(/[♯]/g, '#')
        .replace(/[♭]/g, 'b')
        .replace(/[Δ∆]/g, 'maj')
        .replace(/°/g, 'dim')
        .replace(/ø/g, 'm7b5')
        .replace(/^[([{"'%]+|[)\]}"',.:;]+$/g, '');
    token = token.replace(/^([A-GH](?:#|b)?)\+/i, '$1aug');
    token = token.replace(/^([A-GH](?:#|b)?)-/i, '$1m');
    token = token.replace(/^H(?=[#b]|m|maj|min|dim|sus|add|aug|\d)/i, 'B');
    token = token.replace(/mai(?=\d)/i, 'maj');
    return token;
}

export function normalizeChord(token) {
    var match = token.match(CHORD_TOKEN);
    if (!match) return '';
    var rest = token.slice(match[1].length + (match[2] ? match[2].length : 0));
    var lower = rest.toLowerCase();
    if (lower.indexOf('maj') === 0) rest = 'maj' + rest.slice(3);
    else if (lower.indexOf('min') === 0) rest = 'm' + rest.slice(3);
    else if (lower.indexOf('dim') === 0) rest = 'dim' + rest.slice(3);
    else if (lower.indexOf('aug') === 0) rest = 'aug' + rest.slice(3);
    else if (lower.indexOf('sus') === 0) rest = 'sus' + rest.slice(3);
    else if (lower.indexOf('add') === 0) rest = 'add' + rest.slice(3);
    else if (lower.charAt(0) === 'm') rest = 'm' + rest.slice(1);
    var slash = rest.indexOf('/');
    if (slash !== -1) {
        var bass = rest.slice(slash + 1);
        rest = rest.slice(0, slash) + '/' + bass.charAt(0).toUpperCase() + bass.slice(1);
    }
    return match[1].toUpperCase() + (match[2] || '') + rest;
}

export function mergeChordTokens(tokens) {
    var merged = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var next = tokens[i + 1] || '';
        if (/^[A-G](?:#|b)?$/i.test(token) && /^(?:m|min|minor|maj|major|maj7|m7|7|sus2|sus4|dim|aug|add9)$/i.test(next)) {
            var quality = next.toLowerCase();
            if (quality === 'minor' || quality === 'min') quality = 'm';
            if (quality === 'major') quality = 'maj';
            merged.push(token + quality);
            i += 1;
        } else {
            merged.push(token);
        }
    }
    return merged;
}

export function isRichChord(token) {
    return token.length > 1 && /[0-9#b]|maj|min|dim|aug|sus|add|m|\//i.test(token.slice(1));
}

export function isSimpleLetterChord(token) {
    return /^[A-G](?:#|b)?$/i.test(token);
}

export function isLyricChordWord(token) {
    return token === 'a' || token === 'am';
}

export function collapseChordChanges(chords) {
    var changes = [];
    chords.forEach(function (chord) {
        if (changes.length && changes[changes.length - 1] === chord) return;
        changes.push(chord);
    });
    return changes;
}

export function extractChords(text) {
    var strong = [];
    var cleanSimple = [];
    String(text || '').split(/\n/).forEach(function (line) {
        var tokens = mergeChordTokens(
            line.split(/[\s,;|]+/).map(cleanToken).filter(Boolean).filter(function (token) {
                var upper = token.toUpperCase();
                return upper !== 'N.C.' && upper !== 'NC';
            })
        );
        var parsed = tokens.map(function (token) {
            return CHORD_TOKEN.test(token) ? normalizeChord(token) : '';
        });
        var chordCount = parsed.filter(Boolean).length;
        var hasLyricWord = tokens.some(function (token, index) {
            return !parsed[index] && /[A-Za-z]/.test(token);
        });
        var wordCount = tokens.filter(function (token) { return /[A-Za-z]/.test(token); }).length || tokens.length;
        var lineHasSeveral = chordCount >= 2;
        var mostlyChords = lineHasSeveral && wordCount > 0 && chordCount / wordCount >= 0.45;
        var lineChords = [];
        parsed.forEach(function (chord, index) {
            if (!chord) return;
            var token = tokens[index];
            if (isLyricChordWord(token) && hasLyricWord) return;
            var soloSimple = tokens.length === 1 && isSimpleLetterChord(token) && /^[A-G]/.test(token);
            if (/^[a-g]/.test(token) && !mostlyChords && !lineHasSeveral) return;
            if (mostlyChords || lineHasSeveral || isRichChord(token) || soloSimple) {
                lineChords.push({ chord: chord, simple: isSimpleLetterChord(token) });
            }
        });
        if (!lineChords.length) return;
        var onlySimple = lineChords.every(function (item) { return item.simple; });
        if (lineHasSeveral || !onlySimple) {
            lineChords.forEach(function (item) { strong.push(item.chord); });
        } else if (tokens.length === 1) {
            cleanSimple.push(lineChords[0].chord);
        }
    });
    if (strong.length) return collapseChordChanges(strong.concat(cleanSimple));
    return collapseChordChanges(cleanSimple);
}

export function loadImageElement(source) {
    if (source instanceof HTMLCanvasElement) return Promise.resolve(source);
    return new Promise(function (resolve, reject) {
        var img = new Image();
        var url = typeof source === 'string' ? source : URL.createObjectURL(source);
        img.onload = function () {
            if (typeof source !== 'string') URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = function () { reject(new Error('Could not read this image.')); };
        img.src = url;
    });
}

export function canvasForOcr(source) {
    return loadImageElement(source).then(function (img) {
        var width = img.width;
        var height = img.height;
        var scale = 1;
        if (width < 1600) scale = Math.min(3, 1600 / Math.max(width, 1));
        if (width > 2200) scale = 2200 / width;
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = image.data;
        var rowDark = [];
        var sample = 2;
        for (var y = 0; y < canvas.height; y++) {
            var dark = 0;
            var count = 0;
            for (var x = 0; x < canvas.width; x += sample) {
                var i = (y * canvas.width + x) * 4;
                if (data[i] < 80 && data[i + 1] < 80 && data[i + 2] < 80) dark++;
                count++;
            }
            rowDark[y] = count > 0 && dark / count > 0.62;
        }
        for (var y = 0; y < canvas.height; y++) {
            if (!rowDark[y]) continue;
            for (var x = 0; x < canvas.width; x++) {
                var i = (y * canvas.width + x) * 4;
                data[i] = data[i + 1] = data[i + 2] = 255;
            }
        }
        var min = 255;
        var max = 0;
        for (var p = 0; p < data.length; p += 16) {
            if (data[p] < min) min = data[p];
            if (data[p] > max) max = data[p];
        }
        var range = Math.max(1, max - min);
        for (var p = 0; p < data.length; p += 4) {
            var value = Math.max(0, Math.min(255, (data[p] - min) * 255 / range));
            data[p] = data[p + 1] = data[p + 2] = value;
        }
        ctx.putImageData(image, 0, 0);
        return canvas;
    });
}

export function recognizeCanvas(worker, canvas, mode) {
    return worker.setParameters({ tessedit_pageseg_mode: mode }).then(function () {
        return worker.recognize(canvas);
    }).then(function (result) {
        return (result && result.data && result.data.text) || '';
    });
}

export function recognizeImage(source) {
    if (!window.Tesseract) return Promise.reject(new Error('Chord reader failed to load.'));
    if (!ocrWorkerPromise) {
        ocrWorkerPromise = Tesseract.createWorker('eng').catch(function (err) {
            ocrWorkerPromise = null;
            throw err;
        });
    }
    return Promise.all([ocrWorkerPromise, canvasForOcr(source)]).then(function (ready) {
        var worker = ready[0];
        var canvas = ready[1];
        return recognizeCanvas(worker, canvas, '11').then(function (sparseText) {
            if (extractChords(sparseText).length >= 2) return sparseText;
            return recognizeCanvas(worker, canvas, '6').then(function (blockText) {
                return extractChords(blockText).length > extractChords(sparseText).length ? blockText : sparseText;
            });
        });
    });
}

export function linesFromPdfContent(content) {
    var buckets = [];
    content.items.forEach(function (item) {
        if (!item.str || !String(item.str).trim()) return;
        var y = item.transform ? item.transform[5] : 0;
        var x = item.transform ? item.transform[4] : 0;
        var bucket = null;
        for (var i = 0; i < buckets.length; i++) {
            if (Math.abs(buckets[i].y - y) <= 4) {
                bucket = buckets[i];
                break;
            }
        }
        if (!bucket) {
            bucket = { y: y, items: [] };
            buckets.push(bucket);
        }
        bucket.items.push({ x: x, str: item.str });
    });
    buckets.sort(function (a, b) { return b.y - a.y; });
    return buckets.map(function (bucket) {
        bucket.items.sort(function (a, b) { return a.x - b.x; });
        return bucket.items.map(function (item) { return item.str; }).join(' ');
    }).join('\n');
}

export function textFromPdf(file) {
    if (!window.pdfjsLib) return Promise.reject(new Error('Chord reader failed to load.'));
    return file.arrayBuffer().then(function (buffer) {
        return pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    }).then(function (pdf) {
        var pageCount = Math.min(pdf.numPages, 5);
        var collected = [];
        function readPage(index) {
            if (index > pageCount) return Promise.resolve(collected.join('\n'));
            return pdf.getPage(index).then(function (page) {
                return page.getTextContent().then(function (content) {
                    collected.push(linesFromPdfContent(content));
                    return readPage(index + 1);
                });
            });
        }
        return readPage(1).then(function (text) {
            if (extractChords(text).length >= 2) return text;
            return pdf.getPage(1).then(function (page) {
                var viewport = page.getViewport({ scale: 2 });
                var canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                var ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                    return recognizeImage(canvas);
                });
            }).then(function (ocrText) {
                return extractChords(ocrText).length > extractChords(text).length ? ocrText : text;
            });
        });
    });
}

export function detectChords(file) {
    var pending = file.name.toLowerCase().endsWith('.pdf') ? textFromPdf(file) : recognizeImage(file);
    return pending.then(extractChords);
}

export function chordFromInput(raw) {
    var token = cleanToken(raw);
    if (!token) return null;
    if (!CHORD_TOKEN.test(token)) return '';
    return normalizeChord(token);
}

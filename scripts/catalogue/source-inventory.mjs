import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const swiftDeclarations = /\bpublic\s+struct\s+(\w+)\s*:\s*MotionAtomView\b/g;
const swiftInfo = /\bpublic\s+static\s+let\s+info\s*=\s*MotionAtomInfo\(\s*id:\s*"([a-zA-Z0-9_-]+)"\s*,\s*category:\s*"([^"\\\r\n]+)"/g;
const webCalls = /\batom\s*\(/g;
const webHeaders = /\batom\s*\(\s*\{\s*id\s*:\s*(['"])([a-zA-Z0-9_-]+)\1\s*,\s*(?:tall\s*:\s*true\s*,\s*)?cat\s*:/g;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const diagnostic = (code, sourcePath, message) => ({ code, path: sourcePath, message });
// Locate comments and literals only to reject ambiguous matches, never to erase
// text or manufacture declarations. This deliberately is not a language parser.
function literalOffsets(text) {
    const offsets = new Uint8Array(text.length);
    function regexEnd(start) {
        const before = text.slice(0, start).trimEnd();
        if (before && !/[=(:,[!?:;{}]$/.test(before) && !/\breturn$/.test(before))
            return start;
        let inClass = false;
        for (let i = start + 1; i < text.length && text[i] !== '\n'; i++) {
            if (text[i] === '\\') {
                i++;
                continue;
            }
            if (text[i] === '[')
                inClass = true;
            if (text[i] === ']')
                inClass = false;
            if (text[i] === '/' && !inClass)
                return i + 1;
        }
        return start;
    }
    function quoted(start) {
        const quote = text[start];
        let i = start + 1;
        while (i < text.length) {
            if (text[i] === '\\') {
                i += 2;
                continue;
            }
            if (text[i] === quote)
                return i + 1;
            if (quote === '`' && text[i] === '$' && text[i + 1] === '{') {
                i = interpolation(i + 2);
                continue;
            }
            i++;
        }
        return i;
    }
    function interpolation(start) {
        let depth = 1, i = start;
        while (i < text.length && depth) {
            if (['"', "'", '`'].includes(text[i]))
                i = quoted(i);
            else if (text.startsWith('//', i)) {
                const end = text.indexOf('\n', i + 2);
                i = end < 0 ? text.length : end + 1;
            }
            else if (text.startsWith('/*', i))
                i = comment(i);
            else if (text[i] === '/' && regexEnd(i) > i)
                i = regexEnd(i);
            else {
                if (text[i] === '{')
                    depth++;
                if (text[i] === '}')
                    depth--;
                i++;
            }
        }
        return i;
    }
    function comment(start) {
        let depth = 1, i = start + 2;
        while (i < text.length && depth) {
            if (text.startsWith('/*', i)) {
                depth++;
                i += 2;
            }
            else if (text.startsWith('*/', i)) {
                depth--;
                i += 2;
            }
            else
                i++;
        }
        return i;
    }
    for (let i = 0; i < text.length;) {
        let end = i;
        if (['"', "'", '`'].includes(text[i]))
            end = quoted(i);
        else if (text.startsWith('/*', i))
            end = comment(i);
        else if (text.startsWith('//', i)) {
            end = text.indexOf('\n', i + 2);
            if (end < 0)
                end = text.length;
        }
        if (end === i && text[i] === '/')
            end = regexEnd(i);
        if (end > i) {
            offsets.fill(text.startsWith('//', i) || text.startsWith('/*', i) ? 2 : 1, i, Math.min(end, text.length));
            i = end;
        }
        else
            i++;
    }
    return offsets;
}
export function readSwiftSource(text, relativePath) {
    const declarations = [...text.matchAll(swiftDeclarations)];
    const masked = literalOffsets(text);
    const diagnostics = [];
    const records = [];
    if (declarations.some(m => masked[m.index]) || [...text.matchAll(swiftInfo)].some(m => masked[m.index])) {
        return { records, diagnostics: [diagnostic('unsupported-source-header', relativePath, 'Declaration-shaped text occurs in a comment or literal.')] };
    }
    for (let i = 0; i < declarations.length; i++) {
        const declaration = declarations[i];
        const segment = text.slice(declaration.index, declarations[i + 1]?.index ?? text.length);
        const headers = [...segment.matchAll(swiftInfo)];
        // Count every info assignment, including unsupported assignments beside a valid one.
        const assignments = [...segment.matchAll(/\bpublic\s+static\s+let\s+info\s*=/g)];
        if (headers.length !== 1 || assignments.length !== 1) {
            diagnostics.push(diagnostic('unsupported-source-header', relativePath, `Expected one literal metadata header for ${declaration[1]}.`));
            continue;
        }
        records.push({ platform: 'swift', id: headers[0][1], symbol: declaration[1], category: headers[0][2], path: relativePath, sha256: hash(text), artifactKind: 'recipe' });
    }
    return { records, diagnostics };
}
export function readWebSource(text, relativePath) {
    const masked = literalOffsets(text);
    const calls = [...text.matchAll(webCalls)].filter(m => masked[m.index] !== 2 || /^\s*\{/.test(text.slice(m.index + m[0].length)));
    const headers = [...text.matchAll(webHeaders)];
    if (calls.length !== headers.length || calls.some(m => masked[m.index]))
        return { ids: [], diagnostics: [diagnostic('unsupported-source-header', relativePath, 'Expected a literal declaration header for every atom call; comments and literals are ambiguous.')] };
    return { ids: headers.map(m => m[2]), diagnostics: [] };
}
export function containedFile(root, relativePath) {
    const fail = code => { throw Object.assign(new Error(code), { code }); };
    if (typeof relativePath !== 'string' || relativePath.includes('\\') ||
        path.isAbsolute(relativePath) || relativePath.split('/').some(p => p === '..' || p === '.' || p === ''))
        fail('unsafe-path');
    const base = fs.realpathSync(root);
    let cursor = base;
    for (const part of relativePath.split('/')) {
        cursor = path.join(cursor, part);
        if (fs.lstatSync(cursor).isSymbolicLink())
            fail('symlink-source');
    }
    if (!fs.statSync(cursor).isFile())
        fail('source-not-file');
    const resolved = fs.realpathSync(cursor);
    if (!resolved.startsWith(base + path.sep))
        fail('unsafe-path');
    return resolved;
}
export function collectSources(root) {
    const records = [], diagnostics = [], observations = [];
    const report = (code, p, message) => diagnostics.push(diagnostic(code, p, message));
    const attempt = (p, fn) => { try {
        return fn();
    }
    catch (error) {
        report(error.code ?? 'invalid-source', p, 'Source could not be read or validated.');
        return undefined;
    } };
    const read = p => attempt(p, () => fs.readFileSync(containedFile(root, p)));
    function discover(directory, extension) {
        const files = [];
        attempt(directory, () => {
            // Validate each directory component before traversal, including the root entry.
            let cursor = fs.realpathSync(root);
            for (const part of directory.split('/')) {
                cursor = path.join(cursor, part);
                if (fs.lstatSync(cursor).isSymbolicLink())
                    throw Object.assign(new Error(), { code: 'symlink-source' });
            }
            for (const entry of fs.readdirSync(cursor, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
                const p = `${directory}/${entry.name}`;
                if (entry.isSymbolicLink())
                    report('symlink-source', p, 'Symbolic links are not source files.');
                else if (entry.isDirectory())
                    files.push(...discover(p, extension));
                else if (entry.isFile() && entry.name.endsWith(extension))
                    files.push(p);
            }
        });
        return files;
    }
    for (const p of discover('atoms/swift', '.swift').filter(p => !p.endsWith('.generated.swift'))) {
        const bytes = read(p);
        if (!bytes)
            continue;
        const parsed = readSwiftSource(bytes.toString('utf8'), p);
        diagnostics.push(...parsed.diagnostics);
        records.push(...parsed.records.map(r => ({ ...r, sha256: hash(bytes) })));
    }
    function json(p, valid) {
        const bytes = read(p);
        if (!bytes)
            return [];
        return attempt(p, () => {
            const value = JSON.parse(bytes.toString('utf8'));
            if (!Array.isArray(value) || !value.every(valid))
                throw Object.assign(new Error(), { code: 'invalid-index' });
            return value;
        }) ?? [];
    }
    const blocks = json('atoms/web/blocks.json', v => typeof v === 'string');
    const index = json('atoms/web/index.json', v => v && ['id', 'category', 'file'].every(k => typeof v[k] === 'string'));
    const listed = new Set();
    const ids = new Set();
    for (const block of blocks) {
        if (listed.has(block))
            report('duplicate-block-path', 'atoms/web/blocks.json', 'Block path is repeated.');
        listed.add(block);
    }
    for (const row of index) {
        if (ids.has(row.id))
            report('duplicate-index-id', 'atoms/web/index.json', `Index ID ${row.id} is repeated.`);
        ids.add(row.id);
        if (!listed.has(row.file))
            observations.push(diagnostic('indexed-source-not-loaded', `atoms/web/${row.file}`, `Index ID ${row.id} is declared outside blocks.json.`));
    }
    const discovered = discover('atoms/web/blocks', '.js').map(p => p.slice('atoms/web/'.length));
    for (const block of discovered)
        if (!listed.has(block) && !index.some(row => row.file === block))
            report('unlisted-block', `atoms/web/${block}`, 'Block file is absent from blocks.json.');
    for (const block of new Set([...blocks, ...discovered, ...index.map(r => r.file)])) {
        const p = `atoms/web/${block}`;
        const bytes = read(p);
        if (!bytes)
            continue;
        const parsed = readWebSource(bytes.toString('utf8'), p);
        diagnostics.push(...parsed.diagnostics);
        const rows = index.filter(r => r.file === block);
        const matching = parsed.diagnostics.length === 0 && parsed.ids.length === rows.length && new Set(parsed.ids).size === parsed.ids.length && parsed.ids.every(id => rows.filter(r => r.id === id).length === 1);
        if (!matching) {
            report('index-mismatch', p, 'Block declaration IDs and index IDs disagree.');
            continue;
        }
        for (const id of parsed.ids)
            records.push({ platform: 'web', id, symbol: null, category: rows.find(r => r.id === id).category, path: p, sha256: hash(bytes), artifactKind: 'recipe' });
    }
    return { records, diagnostics, observations };
}

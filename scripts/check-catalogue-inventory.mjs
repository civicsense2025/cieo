import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectSources, containedFile } from './catalogue/source-inventory.mjs';
import { reconcile } from './catalogue/reconcile.mjs';

const destination = 'docs/generated/catalogue-inventory.json';
const baselinePath = 'test/fixtures/catalogue-baseline.json';
const rootPath = fileURLToPath(new URL('../', import.meta.url));
const canonical = values => [...values].sort((a, b) => {
    for (const key of ['code', 'path', 'message']) {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
    }
    return 0;
});
const failure = (code, sourcePath, message) => ({ code, path: sourcePath, message });

export function buildReceipt(root) {
    const collected = collectSources(root);
    let baseline;
    try {
        baseline = JSON.parse(fs.readFileSync(containedFile(root, baselinePath), 'utf8'));
        if (baseline?.formatVersion !== 1 || !/^[a-f0-9]{40}$/.test(baseline.sourceRevision) ||
            !Array.isArray(baseline.records) || !baseline.records.every(record => record &&
                ['swift', 'web'].includes(record.platform) && typeof record.id === 'string' &&
                (record.symbol === null || typeof record.symbol === 'string') && typeof record.path === 'string')) {
            throw new Error('Invalid baseline');
        }
    } catch {
        return { bytes: null, diagnostics: canonical([...collected.diagnostics,
            failure('invalid-baseline', baselinePath, 'Frozen baseline could not be read or validated.')]) };
    }
    const reconciled = reconcile(collected.records, baseline.records);
    const diagnostics = canonical([...collected.diagnostics, ...reconciled.diagnostics]);
    if (diagnostics.length) return { bytes: null, diagnostics };
    return { bytes: JSON.stringify({ formatVersion: 1, baselineRevision: baseline.sourceRevision,
        entries: reconciled.entries, observations: canonical(collected.observations) }, null, 2) + '\n', diagnostics };
}

// Check each existing component before either reading or creating the fixed
// destination. Renaming a file cannot protect against a linked parent folder.
function outputFile(root) {
    let cursor = fs.realpathSync(root);
    const parts = destination.split('/');
    for (const [index, part] of parts.entries()) {
        cursor = path.join(cursor, part);
        let stat;
        try { stat = fs.lstatSync(cursor); }
        catch (error) { if (error.code === 'ENOENT') continue; throw error; }
        if (stat.isSymbolicLink()) throw Object.assign(new Error(), { code: 'symlink-output' });
        if (index < parts.length - 1 ? !stat.isDirectory() : !stat.isFile())
            throw Object.assign(new Error(), { code: 'invalid-output' });
    }
    return cursor;
}
function report(diagnostics) {
    process.stderr.write(JSON.stringify({ diagnostics: canonical(diagnostics) }) + '\n');
    return 1;
}
export function runInventory({ root = rootPath, check = false } = {}) {
    let temporary;
    let ownsTemporary = false;
    try {
        const { bytes, diagnostics } = buildReceipt(root);
        if (diagnostics.length) return report(diagnostics);
        const output = outputFile(root);
        if (check) {
            let existing;
            try { existing = fs.readFileSync(output); }
            catch (error) { if (error.code !== 'ENOENT') throw error; }
            if (!existing || !existing.equals(Buffer.from(bytes)))
                return report([failure('stale-inventory', destination, 'Generate the catalogue receipt before checking it.')]);
            return 0;
        }
        fs.mkdirSync(path.dirname(output), { recursive: true });
        outputFile(root);
        temporary = path.join(path.dirname(output), `.catalogue-inventory-${randomUUID()}.tmp`);
        const descriptor = fs.openSync(temporary, 'wx');
        ownsTemporary = true;
        try { fs.writeFileSync(descriptor, bytes); }
        finally { fs.closeSync(descriptor); }
        outputFile(root);
        fs.renameSync(temporary, output);
        temporary = undefined;
        return 0;
    } catch (error) {
        return report([failure(error.code ?? 'inventory-failure', destination, 'Receipt could not be read or written safely.')]);
    } finally {
        if (temporary && ownsTemporary) fs.rmSync(temporary, { force: true });
    }
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
    const args = process.argv.slice(2);
    if (args.length && !(args.length === 1 && args[0] === '--check')) {
        process.stderr.write(JSON.stringify({ diagnostics: [failure('unsupported-arguments', '', 'Use no arguments or --check.')] }) + '\n');
        process.exitCode = 2;
    } else process.exitCode = runInventory({ check: args[0] === '--check' });
}

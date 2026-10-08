import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readSwiftSource, readWebSource, containedFile, collectSources } from '../scripts/catalogue/source-inventory.mjs';
const swift = 'public struct SampleAtom: MotionAtomView {\npublic static let info = MotionAtomInfo(id: "sample", category: "Writing", name: "Sample", summary: "Demo")\npublic init() {}\npublic var body: some View { Text("Example") }\n}';
test('retains declared identity rather than deriving it from filename', () => {
    const result = readSwiftSource(swift, 'atoms/swift/Writing/Different.swift');
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.records[0].id, 'sample');
    assert.equal(result.records[0].symbol, 'SampleAtom');
    assert.equal(result.records[0].artifactKind, 'recipe');
});
test('unsupported metadata is diagnostic', () => {
    const result = readSwiftSource(swift.replace('id: "sample"', 'id: computedID'), 'sample.swift');
    assert.equal(result.records.length, 0);
    assert.ok(result.diagnostics.some(d => d.code === 'unsupported-source-header'));
});
test('web extraction never executes code', () => {
    assert.deepEqual(readWebSource("atom({ id:'sample', cat:'Writing', init(){ throw Error('never run'); }});", 'sample.js'), { ids: ['sample'], diagnostics: [] });
});
test('ambiguous comment and string declarations are rejected', () => {
    for (const wrap of [s => `/* ${s} */`, s => JSON.stringify(s)]) {
        assert.ok(readSwiftSource(wrap(swift), 'sample.swift').diagnostics.length);
        assert.ok(readWebSource(wrap("atom({ id:'sample', cat:'Writing' });"), 'sample.js').diagnostics.length);
    }
    assert.ok(readSwiftSource(swift.replace('public init()', 'public static let info = MotionAtomInfo(id: "other", category: "Writing")\npublic init()'), 'sample.swift').diagnostics.length);
    assert.ok(readWebSource('atom({ id: computed, cat: "Writing" });', 'sample.js').diagnostics.length);
});
function fixture(t, { blocks = ['blocks/sample.js'], index = [{ id: 'sample', category: 'Writing', file: 'blocks/sample.js' }], source = "atom({ id:'sample', cat:'Writing' });" } = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'inventory-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.mkdirSync(path.join(root, 'atoms/swift/Writing'), { recursive: true });
    fs.mkdirSync(path.join(root, 'atoms/web/blocks'), { recursive: true });
    fs.writeFileSync(path.join(root, 'atoms/swift/Writing/Different.swift'), swift);
    fs.writeFileSync(path.join(root, 'atoms/web/blocks.json'), JSON.stringify(blocks));
    fs.writeFileSync(path.join(root, 'atoms/web/index.json'), JSON.stringify(index));
    fs.writeFileSync(path.join(root, 'atoms/web/blocks/sample.js'), source);
    return root;
}
test('containedFile rejects traversal, absolute paths, symlinks and missing files', t => {
    const root = fixture(t);
    for (const name of ['../outside', '/tmp/outside'])
        assert.throws(() => containedFile(root, name), { code: 'unsafe-path' });
    fs.symlinkSync('/etc/hosts', path.join(root, 'link'));
    assert.throws(() => containedFile(root, 'link'), { code: 'symlink-source' });
    assert.throws(() => containedFile(root, 'missing'), { code: 'ENOENT' });
});
test('collector accounts for sources and exact bytes', t => {
    const result = collectSources(fixture(t));
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.records.length, 2);
    assert.ok(result.records.every(r => /^[a-f0-9]{64}$/.test(r.sha256)));
});
for (const [name, options] of [
    ['index disagreement', { index: [{ id: 'other', category: 'Writing', file: 'blocks/sample.js' }] }],
    ['unindexed recipe', { index: [] }], ['duplicate block', { blocks: ['blocks/sample.js', 'blocks/sample.js'] }],
    ['unsupported header', { source: 'atom({ id: value, cat: "Writing" });' }], ['missing source', { blocks: ['blocks/missing.js'] }],
    ['invalid blocks', { blocks: {} }], ['invalid index', { index: [{ id: 7 }] }],
])
    test(`collector diagnoses ${name}`, t => assert.ok(collectSources(fixture(t, options)).diagnostics.length));
test('shared and multiple recipe blocks are allowed', t => {
    assert.deepEqual(collectSources(fixture(t, { source: 'const shared = 1;', index: [] })).diagnostics, []);
    const root = fixture(t, { source: "atom({id:'sample',cat:'Writing'}); atom({id:'second',cat:'Writing'});", index: [{ id: 'sample', category: 'Writing', file: 'blocks/sample.js' }, { id: 'second', category: 'Writing', file: 'blocks/sample.js' }] });
    assert.deepEqual(collectSources(root).diagnostics, []);
});
test('unlisted block sources cannot disappear', t => {
    const root = fixture(t);
    fs.writeFileSync(path.join(root, 'atoms/web/blocks/unlisted.js'), "atom({id:'hidden',cat:'Writing'});");
    assert.ok(collectSources(root).diagnostics.some(d => d.path.endsWith('unlisted.js')));
});
test('observed headers support tall, nested templates and regex literals', () => {
    const source = 'const pattern = /^"/; const html = `outer ${`inner ${"value"}`} text`;\n' + "/* live atom (JS springs) */ atom({ id:'sample', tall:true, cat:'Writing' });";
    assert.deepEqual(readWebSource(source, 'sample.js'), { ids: ['sample'], diagnostics: [] });
    assert.ok(readWebSource('const example = "atom(computed)";', 'sample.js').diagnostics.length);
    assert.ok(readWebSource("const example = /atom({id:'fake',cat:'Writing'})/;", 'sample.js').diagnostics.length);
});
test('indexed identity sources remain recipes with loading observations', t => {
    const root = fixture(t, { blocks: [] });
    const result = collectSources(root);
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.records.length, 2);
    assert.equal(result.observations.length, 1);
    assert.equal(result.observations[0].code, 'indexed-source-not-loaded');
});
test('duplicate index IDs, source symlinks and unsupported Swift headers are diagnosed', t => {
    const root = fixture(t, { index: [{ id: 'sample', category: 'Writing', file: 'blocks/sample.js' }, { id: 'sample', category: 'Writing', file: 'blocks/sample.js' }] });
    assert.ok(collectSources(root).diagnostics.some(d => d.code === 'duplicate-index-id'));
    fs.symlinkSync('/etc/hosts', path.join(root, 'atoms/swift/Writing/linked.swift'));
    assert.ok(collectSources(root).diagnostics.some(d => d.code === 'symlink-source'));
    fs.writeFileSync(path.join(root, 'atoms/swift/Writing/Different.swift'), swift.replace('id: "sample"', 'id: computed'));
    assert.ok(collectSources(root).diagnostics.some(d => d.code === 'unsupported-source-header'));
});
test('Swift extraction retains declaration order and ignores support code', () => {
    const second = swift.replaceAll('SampleAtom', 'SecondAtom').replace('id: "sample"', 'id: "second"');
    assert.deepEqual(readSwiftSource(swift + '\n' + second, 'combined.swift').records.map(r => r.id), ['sample', 'second']);
    assert.deepEqual(readSwiftSource('public struct Helper {}', 'helper.swift'), { records: [], diagnostics: [] });
});

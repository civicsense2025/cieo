const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const compareFields = fields => (a, b) => {
    for (const field of fields) {
        const order = compare(a[field] ?? '', b[field] ?? '');
        if (order) return order;
    }
    return 0;
};
const compareSources = compareFields(['platform', 'path', 'symbol', 'category', 'sha256', 'artifactKind']);

// The collector owns source validation. Sorting a copy makes collisions and
// their evidence stable while leaving caller-owned arrays and records intact.
export function reconcile(records, baseline = []) {
    const groups = new Map();
    const diagnostics = [];
    for (const record of [...records].sort(compareSources)) {
        const sources = groups.get(record.id) ?? [];
        const duplicate = sources.find(source => source.platform === record.platform);
        if (duplicate) diagnostics.push({
            code: 'duplicate-platform-id', path: record.path,
            message: `${record.platform}:${record.id} is declared by ${duplicate.path} and ${record.path}`
        });
        sources.push(record);
        groups.set(record.id, sources);
    }
    for (const original of baseline) {
        const current = (groups.get(original.id) ?? []).find(source => source.platform === original.platform);
        if (!current) diagnostics.push({
            code: 'missing-baseline-id', path: original.path,
            message: `Missing ${original.platform}:${original.id}`
        });
        else if (current.symbol !== original.symbol) diagnostics.push({
            code: 'changed-baseline-symbol', path: current.path,
            message: `Changed public symbol for ${original.platform}:${original.id}`
        });
    }
    const entries = [...groups].sort(([a], [b]) => compare(a, b)).map(([id, sources]) => ({
        id, artifactKind: 'recipe',
        platformStatus: new Set(sources.map(source => source.platform)).size === 2 ? 'paired' : `${sources[0].platform}-only`,
        sources
    }));
    return { entries, diagnostics: diagnostics.sort(compareFields(['code', 'path', 'message'])) };
}

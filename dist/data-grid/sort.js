/* Sorting for data rows. Missing values sort last in both directions, equal rows keep their input order, and the input array is never changed. Pure TypeScript. */
import { cellOf, displayText, indexProperties, isEmptyValue, isoDayOf, numericValue, } from './properties.js';
/* One collator for every text comparison. A fixed locale keeps the order the same on every reader's machine. */
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
function compareNumbers(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
function compareCodeUnits(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/* Options rank by their position in the list. A value that is not listed ranks after every option, so it never sorts ahead of a real option. */
function optionRank(options) {
    const ranks = new Map();
    options.forEach((option, index) => {
        if (!ranks.has(option))
            ranks.set(option, index);
    });
    return (value) => ranks.get(displayText('select', value)) ?? options.length;
}
function orderingFor(def) {
    switch (def.type) {
        case 'number':
            return {
                missing: (value) => numericValue(value) === null,
                compare: (a, b) => compareNumbers(numericValue(a) ?? 0, numericValue(b) ?? 0),
            };
        case 'checkbox':
            // Only a real boolean sorts: unchecked first, then checked.
            return {
                missing: (value) => typeof value !== 'boolean',
                compare: (a, b) => Number(a === true) - Number(b === true),
            };
        case 'select':
        case 'status': {
            const rank = optionRank(def.options ?? []);
            return {
                missing: isEmptyValue,
                compare: (a, b) => rank(a) - rank(b) || collator.compare(displayText(def.type, a), displayText(def.type, b)),
            };
        }
        case 'date':
            return {
                missing: (value) => isoDayOf(value) === null,
                compare: (a, b) => compareCodeUnits(isoDayOf(a) ?? '', isoDayOf(b) ?? ''),
            };
        default:
            // text, link and relation: natural text order.
            return {
                missing: isEmptyValue,
                compare: (a, b) => collator.compare(displayText(def.type, a), displayText(def.type, b)),
            };
    }
}
/** Returns the rows sorted by each rule in turn; later rules only break ties. A rule on a property the schema lacks is ignored. */
export function sortRows(rows, properties, sorts) {
    const byId = indexProperties(properties);
    const steps = sorts.flatMap((rule) => {
        const def = byId.get(rule.property);
        if (!def)
            return [];
        return [{ id: def.id, sign: rule.direction === 'desc' ? -1 : 1, ordering: orderingFor(def) }];
    });
    return [...rows].sort((a, b) => {
        for (const step of steps) {
            const x = cellOf(a, step.id);
            const y = cellOf(b, step.id);
            const xMissing = step.ordering.missing(x);
            const yMissing = step.ordering.missing(y);
            if (xMissing || yMissing) {
                if (xMissing && yMissing)
                    continue;
                // Missing values go last whatever the direction, so the sign is not applied here.
                return xMissing ? 1 : -1;
            }
            const c = step.ordering.compare(x, y);
            if (c !== 0)
                return c * step.sign;
        }
        return 0;
    });
}

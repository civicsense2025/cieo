/* Filter rules for data rows. Every rule must hold for a row. A rule that cannot be evaluated yet (no value, a value its type cannot read, a property the schema lacks, or an operator its type does not offer) is inactive, so it never hides rows. Pure TypeScript. */
import { cellOf, displayText, indexProperties, isEmptyValue, isIsoDate, isoDayOf, numericValue, } from './properties.js';
const TEXT_OPERATORS = ['contains', 'is', 'isNot', 'isEmpty', 'isNotEmpty'];
/** The operators each property type offers. Number also offers is-not-empty, so a number column filters for filled cells the way other types do. */
export const OPERATORS_BY_TYPE = {
    text: TEXT_OPERATORS,
    link: TEXT_OPERATORS,
    relation: TEXT_OPERATORS,
    number: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'isEmpty', 'isNotEmpty'],
    select: ['is', 'isNot', 'isEmpty', 'isNotEmpty'],
    status: ['is', 'isNot', 'isEmpty', 'isNotEmpty'],
    date: ['is', 'before', 'after', 'isEmpty', 'isNotEmpty'],
    checkbox: ['checked', 'unchecked'],
};
function compareNumbers(operator, a, b) {
    switch (operator) {
        case 'eq': return a === b;
        case 'ne': return a !== b;
        case 'gt': return a > b;
        case 'lt': return a < b;
        case 'gte': return a >= b;
        case 'lte': return a <= b;
        default: return false;
    }
}
/* Whether one value satisfies one rule. The caller has already found the property. */
function ruleHolds(def, value, rule) {
    if (!OPERATORS_BY_TYPE[def.type].includes(rule.operator))
        return true;
    // A checkbox that is not set counts as unchecked.
    if (def.type === 'checkbox')
        return rule.operator === 'checked' ? value === true : value !== true;
    if (rule.operator === 'isEmpty')
        return isEmptyValue(value);
    if (rule.operator === 'isNotEmpty')
        return !isEmptyValue(value);
    const needle = (rule.value ?? '').trim();
    if (needle === '')
        return true;
    switch (def.type) {
        case 'number': {
            const wanted = numericValue(needle);
            if (wanted === null)
                return true;
            // An empty or non-numeric cell matches no comparison, not even "not equal".
            const actual = numericValue(value);
            return actual !== null && compareNumbers(rule.operator, actual, wanted);
        }
        case 'date': {
            if (!isIsoDate(needle))
                return true;
            const day = isoDayOf(value);
            if (day === null)
                return false;
            if (rule.operator === 'is')
                return day === needle;
            return rule.operator === 'before' ? day < needle : day > needle;
        }
        case 'select':
        case 'status': {
            const same = displayText(def.type, value).trim() === needle;
            return rule.operator === 'is' ? same : !same;
        }
        default: {
            // text, link and relation compare case-insensitively.
            const actual = displayText(def.type, value).trim().toLowerCase();
            const wanted = needle.toLowerCase();
            if (rule.operator === 'contains')
                return actual.includes(wanted);
            return rule.operator === 'is' ? actual === wanted : actual !== wanted;
        }
    }
}
/** Keeps the rows that satisfy every rule. With no rules, every row is kept. */
export function filterRows(rows, properties, rules) {
    const byId = indexProperties(properties);
    const checks = rules.flatMap((rule) => {
        const def = byId.get(rule.property);
        return def ? [{ def, rule }] : [];
    });
    return rows.filter((row) => checks.every(({ def, rule }) => ruleHolds(def, cellOf(row, def.id), rule)));
}

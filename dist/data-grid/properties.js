/* Property model for data grids: the eight property types, the shape of a cell, and the value helpers that sort, filter, aggregate and CSV rules share. Pure TypeScript: no DOM, no React. */
export const PROPERTY_TYPES = ['text', 'number', 'select', 'status', 'date', 'checkbox', 'link', 'relation'];
export function isPropertyType(value) {
    return typeof value === 'string' && PROPERTY_TYPES.includes(value);
}
/** The value of a property in a row. Only the row's own keys count, so a property named "constructor" reads as missing. */
export function cellOf(row, propertyId) {
    return Object.prototype.hasOwnProperty.call(row.values, propertyId) ? row.values[propertyId] : undefined;
}
/** Looks properties up by id. A duplicate id throws, because the column it names would be ambiguous. */
export function indexProperties(properties) {
    const index = new Map();
    for (const def of properties) {
        if (index.has(def.id))
            throw new RangeError(`Duplicate property id: ${def.id}`);
        index.set(def.id, def);
    }
    return index;
}
/** Empty means no usable value. A checkbox's false and a number's 0 are real values. */
export function isEmptyValue(value) {
    if (value === undefined || value === null)
        return true;
    if (typeof value === 'string')
        return value.trim() === '';
    if (typeof value === 'number')
        return !Number.isFinite(value);
    return false;
}
/* Plain decimal text: optional sign, optional exponent. Leading zeros are not accepted, so codes like 007 keep their text. */
const DECIMAL = /^[+-]?(?:(?:0|[1-9]\d*)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/;
/** The one number reader every rule shares. Returns null unless the value is a finite number written as plain decimal text. */
export function numericValue(value) {
    if (typeof value === 'number')
        return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string')
        return null;
    const text = value.trim();
    if (!DECIMAL.test(text))
        return null;
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
}
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
/** True for a YYYY-MM-DD calendar day that exists. Matched exactly, so trim the text first. */
export function isIsoDate(text) {
    const match = ISO_DAY.exec(text);
    if (!match)
        return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
/** The trimmed text when the value is a real YYYY-MM-DD day; otherwise null. */
export function isoDayOf(value) {
    if (typeof value !== 'string')
        return null;
    const day = value.trim();
    return isIsoDate(day) ? day : null;
}
/* An absolute http or https URL. Quotes, angle brackets, whitespace and control characters are refused, so the value is safe in an href attribute. */
const LINK_TEXT = /^https?:\/\/[^\s"'<>\u0000-\u001f\u007f]+$/i;
/** The trimmed address when it is safe to put in an href; otherwise null. */
export function safeLinkHref(text) {
    const href = text.trim();
    if (!LINK_TEXT.test(href))
        return null;
    try {
        const { protocol } = new URL(href);
        return protocol === 'http:' || protocol === 'https:' ? href : null;
    }
    catch {
        return null;
    }
}
/** The text of a value that is not empty: yes or no for booleans, plain digits for numbers. */
function textOf(value) {
    if (isEmptyValue(value))
        return '';
    if (typeof value === 'boolean')
        return value ? 'yes' : 'no';
    return String(value);
}
/** The text a person sees or a CSV writes. A relation shows its label when the resolver knows the id, and the id otherwise. */
export function displayText(type, value, labelOf) {
    if (type === 'relation' && typeof value === 'string' && !isEmptyValue(value))
        return labelOf?.(value) ?? value;
    return textOf(value);
}
/** Converts a value to another property type. A value that cannot be read as the new type becomes missing; for a checkbox, anything unrecognized reads as unchecked. */
export function convertValue(value, to) {
    if (isEmptyValue(value))
        return undefined;
    switch (to) {
        case 'checkbox':
            return typeof value === 'boolean' ? value : /^(true|yes|1|x|✓)$/i.test(textOf(value).trim());
        case 'number':
            return numericValue(value) ?? undefined;
        case 'date': {
            const day = textOf(value).trim();
            return isIsoDate(day) ? day : undefined;
        }
        default:
            return textOf(value);
    }
}

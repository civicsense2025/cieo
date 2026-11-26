/* Spreadsheet formula guard for CSV export and import. Text a spreadsheet could run as a formula or a DDE command gets one leading apostrophe when it is written, and the import removes exactly that apostrophe. Imported CSV is untrusted, so the guard never trusts a cell's own apostrophes. Pure TypeScript. */
import { numericValue } from './properties.js';
/** True when a spreadsheet could read the text as a formula once it is opened. A minus sign followed by a plain number is safe; any other minus sign is not. */
export function startsAsFormula(text) {
    if (text.startsWith('\t') || text.startsWith('\r'))
        return true;
    // Leading spaces do not hide a formula from a spreadsheet, so they are looked past.
    const body = text.replace(/^[ \t\r\n]+/, '');
    if (body.startsWith('=') || body.startsWith('+') || body.startsWith('@'))
        return true;
    return body.startsWith('-') && numericValue(body) === null;
}
/* Quotes in front of a cell are looked past, so an apostrophe typed by a person cannot switch the guard off. */
function core(text) {
    return text.replace(/^'+/, '');
}
/** The export form of a cell: one apostrophe added in front when the cell would start a formula. */
export function neutralizeFormula(text) {
    return startsAsFormula(core(text)) ? `'${text}` : text;
}
/** The import form of a cell: removes the one apostrophe that neutralizeFormula added, and nothing else. */
export function restoreFormula(cell) {
    return cell.startsWith("'") && startsAsFormula(core(cell)) ? cell.slice(1) : cell;
}

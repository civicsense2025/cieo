/* CSV export. Fields with commas, quotes or line breaks are quoted. Text a spreadsheet could run as a formula is neutralized first. Records end in CRLF, as RFC 4180 specifies. Pure TypeScript. */
import { neutralizeFormula } from './formula.js';
import { cellOf, displayText } from './properties.js';
function quoteField(text) {
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
/* A record with one empty field would read back as a blank line, which the importer skips, so it is written as "". */
function record(fields) {
    if (fields.length === 1 && fields[0] === '')
        return '""';
    return fields.map(quoteField).join(',');
}
/* A checkbox writes true or false, so the import reads it back as a checkbox. Other types write their display text. */
function cellText(def, value) {
    if (def.type === 'checkbox')
        return value === true ? 'true' : value === false ? 'false' : '';
    return displayText(def.type, value);
}
/** The rows as CSV text: a header of property names, then one record per row. A relation writes the id it stores. */
export function exportCsv(properties, rows) {
    const header = record(properties.map((def) => neutralizeFormula(def.name)));
    const body = rows.map((row) => record(properties.map((def) => neutralizeFormula(cellText(def, cellOf(row, def.id))))));
    return [header, ...body].join('\r\n');
}

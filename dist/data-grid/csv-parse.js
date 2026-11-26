/* RFC 4180 parsing with the lenient edges spreadsheets produce: a byte-order mark is dropped, a quote in the middle of an unquoted field is literal, and text after a closing quote joins its field. Records past the limit are read and counted, never stored, so a large untrusted file stays bounded. Pure TypeScript. */
export function parseCsv(text, maxRecords) {
    const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    const records = [];
    let row = [];
    let field = '';
    let keeping = maxRecords > 0;
    let inQuotes = false;
    let atFieldStart = true;
    let started = false;
    let droppedRecords = 0;
    let blankLines = 0;
    const put = (chunk) => {
        if (keeping)
            field += chunk;
    };
    const endRecord = () => {
        if (keeping) {
            row.push(field);
            records.push(row);
            keeping = records.length < maxRecords;
        }
        else {
            droppedRecords += 1;
        }
        row = [];
        field = '';
        atFieldStart = true;
        started = false;
    };
    for (let i = 0; i < src.length; i += 1) {
        const ch = src[i];
        if (inQuotes) {
            if (ch !== '"')
                put(ch);
            else if (src[i + 1] === '"') {
                put('"');
                i += 1;
            }
            else
                inQuotes = false;
            continue;
        }
        if (ch === '"' && atFieldStart) {
            inQuotes = true;
            atFieldStart = false;
            started = true;
            continue;
        }
        if (ch === ',') {
            if (keeping)
                row.push(field);
            field = '';
            atFieldStart = true;
            started = true;
            continue;
        }
        if (ch === '\r' || ch === '\n') {
            if (started)
                endRecord();
            else
                blankLines += 1;
            if (ch === '\r' && src[i + 1] === '\n')
                i += 1;
            continue;
        }
        put(ch);
        atFieldStart = false;
        started = true;
    }
    if (inQuotes)
        return { records: [], droppedRecords: 0, blankLines, unterminatedQuote: true };
    if (started)
        endRecord();
    return { records, droppedRecords, blankLines, unterminatedQuote: false };
}

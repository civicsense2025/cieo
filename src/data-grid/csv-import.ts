/* CSV import. Reads the text once, keeps at most 2000 rows and 40 columns, infers each column's property type from its values, and reports whatever it could not keep, so nothing is dropped silently. Imported text is untrusted: formula apostrophes are restored, and no cell is ever evaluated. Pure TypeScript. */
import { parseCsv } from './csv-parse.js';
import { restoreFormula } from './formula.js';
import {
  isIsoDate, numericValue, safeLinkHref,
  type CellValue, type DataRow, type PropertyDef, type PropertyType,
} from './properties.js';

export const CSV_IMPORT_LIMITS = { rows: 2000, columns: 40 } as const;

/* A column becomes a select only when values repeat: enough values, few distinct options, and each option used about twice. */
const SELECT_MIN_VALUES = 4;
const SELECT_MAX_OPTIONS = 8;

export interface CsvImportReport {
  /** Data rows past the row limit. */
  readonly rowsDropped: number;
  /** Header columns past the column limit. */
  readonly columnsDropped: number;
  /** Non-empty cells that sit past the end of the header. */
  readonly ignoredCells: number;
  /** Empty lines that were skipped. */
  readonly blankLines: number;
}

export type CsvImportResult =
  | { readonly ok: true; readonly properties: PropertyDef[]; readonly rows: DataRow[]; readonly report: CsvImportReport }
  | { readonly ok: false; readonly reason: 'empty' | 'unterminated-quote' };

/* A blank name takes its column position ("Column 3"). A repeated name takes the first number that makes it unique. */
function headerName(cell: string, index: number): string {
  const name = restoreFormula(cell).trim();
  return name === '' ? `Column ${index + 1}` : name;
}

function uniqueNames(names: readonly string[]): string[] {
  const taken = new Set<string>();
  return names.map((base) => {
    let name = base;
    for (let n = 2; taken.has(name); n += 1) name = `${base} ${n}`;
    taken.add(name);
    return name;
  });
}

/** The type of a column from its non-empty values, already trimmed. */
function inferType(values: readonly string[]): PropertyType {
  if (values.length === 0) return 'text';
  if (values.every((value) => numericValue(value) !== null)) return 'number';
  if (values.every((value) => isIsoDate(value))) return 'date';
  if (values.every((value) => /^(true|false|yes|no)$/i.test(value))) return 'checkbox';
  if (values.every((value) => safeLinkHref(value) !== null)) return 'link';
  const distinct = new Set(values).size;
  const enoughValues = distinct <= SELECT_MAX_OPTIONS && values.length >= SELECT_MIN_VALUES;
  return enoughValues && distinct * 2 <= values.length ? 'select' : 'text';
}

/* Text keeps its exact spacing. Every other type is trimmed, and a blank cell is missing rather than false or zero. */
function cellValue(type: PropertyType, cell: string): CellValue {
  if (type === 'text') return cell === '' ? undefined : cell;
  const text = cell.trim();
  if (text === '') return undefined;
  if (type === 'number') return numericValue(text) ?? undefined;
  if (type === 'checkbox') return /^(true|yes)$/i.test(text);
  return text;
}

export function importCsv(text: string): CsvImportResult {
  const parsed = parseCsv(text, CSV_IMPORT_LIMITS.rows + 1);
  if (parsed.unterminatedQuote) return { ok: false, reason: 'unterminated-quote' };
  if (parsed.records.length === 0) return { ok: false, reason: 'empty' };
  const [header, ...records] = parsed.records;
  const kept = Math.min(header.length, CSV_IMPORT_LIMITS.columns);
  const names = uniqueNames(header.slice(0, kept).map(headerName));
  const cells = records.map((record) => names.map((_, j) => restoreFormula(record[j] ?? '')));
  // The first column is the row's label, so it is always text.
  const types = names.map((_, j) =>
    j === 0 ? 'text' : inferType(cells.map((row) => row[j].trim()).filter((value) => value !== '')),
  );
  const properties: PropertyDef[] = names.map((name, j) => {
    const type = types[j];
    const id = `c${j}`;
    if (type !== 'select') return { id, name, type };
    const options = [...new Set(cells.map((row) => row[j].trim()).filter((value) => value !== ''))];
    return { id, name, type, options };
  });
  const rows: DataRow[] = cells.map((row, k) => {
    const values: Record<string, CellValue> = {};
    properties.forEach((def, j) => {
      const value = cellValue(def.type, row[j]);
      if (value !== undefined) values[def.id] = value;
    });
    return { id: `r${k + 1}`, values };
  });
  const ignoredCells = records.reduce(
    (total, record) => total + record.slice(header.length).filter((cell) => cell.trim() !== '').length,
    0,
  );
  return {
    ok: true,
    properties,
    rows,
    report: {
      rowsDropped: parsed.droppedRecords,
      columnsDropped: Math.max(0, header.length - CSV_IMPORT_LIMITS.columns),
      ignoredCells,
      blankLines: parsed.blankLines,
    },
  };
}

import { type DataRow, type PropertyDef } from './properties.js';
export declare const CSV_IMPORT_LIMITS: {
    readonly rows: 2000;
    readonly columns: 40;
};
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
export type CsvImportResult = {
    readonly ok: true;
    readonly properties: PropertyDef[];
    readonly rows: DataRow[];
    readonly report: CsvImportReport;
} | {
    readonly ok: false;
    readonly reason: 'empty' | 'unterminated-quote';
};
export declare function importCsv(text: string): CsvImportResult;

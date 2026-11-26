export interface CsvParseResult {
    /** Stored records, at most the limit. Empty when the text ends inside a quoted field. */
    readonly records: string[][];
    /** Records past the limit: read and counted, but not stored. */
    readonly droppedRecords: number;
    /** Empty lines, which are skipped. */
    readonly blankLines: number;
    readonly unterminatedQuote: boolean;
}
export declare function parseCsv(text: string, maxRecords: number): CsvParseResult;

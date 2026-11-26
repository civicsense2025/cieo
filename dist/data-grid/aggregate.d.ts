import { type CellValue, type DataRow } from './properties.js';
export declare const AGGREGATE_KINDS: readonly ["count", "countEmpty", "sum", "average", "min", "max"];
export type AggregateKind = (typeof AGGREGATE_KINDS)[number];
/**
 * One calculation over a list of cell values. Count and count empty always give a number. The numeric calculations give null when no value is numeric, and also when the result is not finite (a sum can overflow).
 */
export declare function aggregateValues(values: readonly CellValue[], kind: AggregateKind): number | null;
/** The calculation over one property of every row. A row without the property counts as empty. */
export declare function aggregateColumn(rows: readonly DataRow[], propertyId: string, kind: AggregateKind): number | null;

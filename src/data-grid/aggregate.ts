/* Totals over one property's cells. Only numeric readings feed sum, average, min and max. A set with no value to total reports null, never NaN or zero. Pure TypeScript. */
import { cellOf, isEmptyValue, numericValue, type CellValue, type DataRow } from './properties.js';

export const AGGREGATE_KINDS = ['count', 'countEmpty', 'sum', 'average', 'min', 'max'] as const;
export type AggregateKind = (typeof AGGREGATE_KINDS)[number];

/**
 * One calculation over a list of cell values. Count and count empty always give a number. The numeric calculations give null when no value is numeric, and also when the result is not finite (a sum can overflow).
 */
export function aggregateValues(values: readonly CellValue[], kind: AggregateKind): number | null {
  if (!(AGGREGATE_KINDS as readonly string[]).includes(kind)) throw new RangeError(`Unknown aggregate: ${String(kind)}`);
  if (kind === 'count') return values.filter((value) => !isEmptyValue(value)).length;
  if (kind === 'countEmpty') return values.filter((value) => isEmptyValue(value)).length;
  let count = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    const n = numericValue(value);
    if (n === null) continue;
    count += 1;
    sum += n;
    if (n < min) min = n;
    if (n > max) max = n;
  }
  if (count === 0) return null;
  const result = kind === 'sum' ? sum : kind === 'average' ? sum / count : kind === 'min' ? min : max;
  return Number.isFinite(result) ? result : null;
}

/** The calculation over one property of every row. A row without the property counts as empty. */
export function aggregateColumn(rows: readonly DataRow[], propertyId: string, kind: AggregateKind): number | null {
  return aggregateValues(rows.map((row) => cellOf(row, propertyId)), kind);
}

/* A data view: the filter rules and sort rules a table shows, applied together. Filtering runs first, so sorting only orders the rows that are shown. Pure TypeScript. */
import { filterRows, type FilterRule } from './filter.js';
import type { DataRow, PropertyDef } from './properties.js';
import { sortRows, type SortRule } from './sort.js';

export interface DataView {
  readonly filters?: readonly FilterRule[];
  readonly sorts?: readonly SortRule[];
}

/** The rows a view shows, in the order it shows them. The input array is not changed. */
export function applyView<R extends DataRow>(
  rows: readonly R[],
  properties: readonly PropertyDef[],
  view: DataView = {},
): R[] {
  return sortRows(filterRows(rows, properties, view.filters ?? []), properties, view.sorts ?? []);
}

/* A data view: the filter rules and sort rules a table shows, applied together. Filtering runs first, so sorting only orders the rows that are shown. Pure TypeScript. */
import { filterRows } from './filter.js';
import { sortRows } from './sort.js';
/** The rows a view shows, in the order it shows them. The input array is not changed. */
export function applyView(rows, properties, view = {}) {
    return sortRows(filterRows(rows, properties, view.filters ?? []), properties, view.sorts ?? []);
}

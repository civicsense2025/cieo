import { type FilterRule } from './filter.js';
import type { DataRow, PropertyDef } from './properties.js';
import { type SortRule } from './sort.js';
export interface DataView {
    readonly filters?: readonly FilterRule[];
    readonly sorts?: readonly SortRule[];
}
/** The rows a view shows, in the order it shows them. The input array is not changed. */
export declare function applyView<R extends DataRow>(rows: readonly R[], properties: readonly PropertyDef[], view?: DataView): R[];

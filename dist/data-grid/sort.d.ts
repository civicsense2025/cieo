import { type DataRow, type PropertyDef } from './properties.js';
export type SortDirection = 'asc' | 'desc';
export interface SortRule {
    readonly property: string;
    readonly direction: SortDirection;
}
/** Returns the rows sorted by each rule in turn; later rules only break ties. A rule on a property the schema lacks is ignored. */
export declare function sortRows<R extends DataRow>(rows: readonly R[], properties: readonly PropertyDef[], sorts: readonly SortRule[]): R[];

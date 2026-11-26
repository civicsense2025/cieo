import { type DataRow, type PropertyDef } from './properties.js';
/** The rows as CSV text: a header of property names, then one record per row. A relation writes the id it stores. */
export declare function exportCsv(properties: readonly PropertyDef[], rows: readonly DataRow[]): string;

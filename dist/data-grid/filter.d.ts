import { type DataRow, type PropertyDef, type PropertyType } from './properties.js';
export type FilterOperator = 'contains' | 'is' | 'isNot' | 'isEmpty' | 'isNotEmpty' | 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'before' | 'after' | 'checked' | 'unchecked';
/** The operators each property type offers. Number also offers is-not-empty, so a number column filters for filled cells the way other types do. */
export declare const OPERATORS_BY_TYPE: Readonly<Record<PropertyType, readonly FilterOperator[]>>;
export interface FilterRule {
    readonly property: string;
    readonly operator: FilterOperator;
    /** The compared value as the person typed or picked it. Operators that take no value ignore it. */
    readonly value?: string;
}
/** Keeps the rows that satisfy every rule. With no rules, every row is kept. */
export declare function filterRows<R extends DataRow>(rows: readonly R[], properties: readonly PropertyDef[], rules: readonly FilterRule[]): R[];

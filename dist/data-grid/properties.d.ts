export declare const PROPERTY_TYPES: readonly ["text", "number", "select", "status", "date", "checkbox", "link", "relation"];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
/** A stored cell. Undefined and null mean no value. A boolean is only meaningful in checkbox properties. */
export type CellValue = string | number | boolean | null | undefined;
export interface PropertyDef {
    /** Stable identity. Rows key their values by this id, so an id is never reused. */
    readonly id: string;
    readonly name: string;
    readonly type: PropertyType;
    /** Select and status only: the options, in the order they sort. */
    readonly options?: readonly string[];
}
export interface DataRow {
    readonly id: string;
    /** Values keyed by property id. Read them with cellOf, never by plain property access. */
    readonly values: Readonly<Record<string, CellValue>>;
}
export declare function isPropertyType(value: unknown): value is PropertyType;
/** The value of a property in a row. Only the row's own keys count, so a property named "constructor" reads as missing. */
export declare function cellOf(row: DataRow, propertyId: string): CellValue;
/** Looks properties up by id. A duplicate id throws, because the column it names would be ambiguous. */
export declare function indexProperties(properties: readonly PropertyDef[]): ReadonlyMap<string, PropertyDef>;
/** Empty means no usable value. A checkbox's false and a number's 0 are real values. */
export declare function isEmptyValue(value: CellValue): boolean;
/** The one number reader every rule shares. Returns null unless the value is a finite number written as plain decimal text. */
export declare function numericValue(value: CellValue): number | null;
/** True for a YYYY-MM-DD calendar day that exists. Matched exactly, so trim the text first. */
export declare function isIsoDate(text: string): boolean;
/** The trimmed text when the value is a real YYYY-MM-DD day; otherwise null. */
export declare function isoDayOf(value: CellValue): string | null;
/** The trimmed address when it is safe to put in an href; otherwise null. */
export declare function safeLinkHref(text: string): string | null;
/** The text a person sees or a CSV writes. A relation shows its label when the resolver knows the id, and the id otherwise. */
export declare function displayText(type: PropertyType, value: CellValue, labelOf?: (id: string) => string | undefined): string;
/** Converts a value to another property type. A value that cannot be read as the new type becomes missing; for a checkbox, anything unrecognized reads as unchecked. */
export declare function convertValue(value: CellValue, to: PropertyType): CellValue;

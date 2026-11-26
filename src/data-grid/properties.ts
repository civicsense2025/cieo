/* Property model for data grids: the eight property types, the shape of a cell, and the value helpers that sort, filter, aggregate and CSV rules share. Pure TypeScript: no DOM, no React. */

export const PROPERTY_TYPES = ['text', 'number', 'select', 'status', 'date', 'checkbox', 'link', 'relation'] as const;
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

export function isPropertyType(value: unknown): value is PropertyType {
  return typeof value === 'string' && (PROPERTY_TYPES as readonly string[]).includes(value);
}

/** The value of a property in a row. Only the row's own keys count, so a property named "constructor" reads as missing. */
export function cellOf(row: DataRow, propertyId: string): CellValue {
  return Object.prototype.hasOwnProperty.call(row.values, propertyId) ? row.values[propertyId] : undefined;
}

/** Looks properties up by id. A duplicate id throws, because the column it names would be ambiguous. */
export function indexProperties(properties: readonly PropertyDef[]): ReadonlyMap<string, PropertyDef> {
  const index = new Map<string, PropertyDef>();
  for (const def of properties) {
    if (index.has(def.id)) throw new RangeError(`Duplicate property id: ${def.id}`);
    index.set(def.id, def);
  }
  return index;
}

/** Empty means no usable value. A checkbox's false and a number's 0 are real values. */
export function isEmptyValue(value: CellValue): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return !Number.isFinite(value);
  return false;
}

/* Plain decimal text: optional sign, optional exponent. Leading zeros are not accepted, so codes like 007 keep their text. */
const DECIMAL = /^[+-]?(?:(?:0|[1-9]\d*)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/** The one number reader every rule shares. Returns null unless the value is a finite number written as plain decimal text. */
export function numericValue(value: CellValue): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!DECIMAL.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a YYYY-MM-DD calendar day that exists. Matched exactly, so trim the text first. */
export function isIsoDate(text: string): boolean {
  const match = ISO_DAY.exec(text);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** The trimmed text when the value is a real YYYY-MM-DD day; otherwise null. */
export function isoDayOf(value: CellValue): string | null {
  if (typeof value !== 'string') return null;
  const day = value.trim();
  return isIsoDate(day) ? day : null;
}

/* An absolute http or https URL. Quotes, angle brackets, whitespace and control characters are refused, so the value is safe in an href attribute. */
const LINK_TEXT = /^https?:\/\/[^\s"'<>\u0000-\u001f\u007f]+$/i;

/** The trimmed address when it is safe to put in an href; otherwise null. */
export function safeLinkHref(text: string): string | null {
  const href = text.trim();
  if (!LINK_TEXT.test(href)) return null;
  try {
    const { protocol } = new URL(href);
    return protocol === 'http:' || protocol === 'https:' ? href : null;
  } catch {
    return null;
  }
}

/** The text of a value that is not empty: yes or no for booleans, plain digits for numbers. */
function textOf(value: CellValue): string {
  if (isEmptyValue(value)) return '';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return String(value);
}

/** The text a person sees or a CSV writes. A relation shows its label when the resolver knows the id, and the id otherwise. */
export function displayText(
  type: PropertyType,
  value: CellValue,
  labelOf?: (id: string) => string | undefined,
): string {
  if (type === 'relation' && typeof value === 'string' && !isEmptyValue(value)) return labelOf?.(value) ?? value;
  return textOf(value);
}

/** Converts a value to another property type. A value that cannot be read as the new type becomes missing; for a checkbox, anything unrecognized reads as unchecked. */
export function convertValue(value: CellValue, to: PropertyType): CellValue {
  if (isEmptyValue(value)) return undefined;
  switch (to) {
    case 'checkbox':
      return typeof value === 'boolean' ? value : /^(true|yes|1|x|✓)$/i.test(textOf(value).trim());
    case 'number':
      return numericValue(value) ?? undefined;
    case 'date': {
      const day = textOf(value).trim();
      return isIsoDate(day) ? day : undefined;
    }
    default:
      return textOf(value);
  }
}

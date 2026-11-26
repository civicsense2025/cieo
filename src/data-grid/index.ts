/* Data grid logic: property model, sorting, filtering, aggregates, formula-safe CSV and view composition. Pure TypeScript with no DOM or React dependency. */

export {
  PROPERTY_TYPES, isPropertyType, isEmptyValue, displayText, numericValue, isIsoDate, isoDayOf, safeLinkHref, cellOf, indexProperties, convertValue,
  type PropertyType, type CellValue, type PropertyDef, type DataRow,
} from './properties.js';

export { sortRows, type SortRule, type SortDirection } from './sort.js';
export { filterRows, OPERATORS_BY_TYPE, type FilterRule, type FilterOperator } from './filter.js';

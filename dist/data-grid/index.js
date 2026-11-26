/* Data grid logic: property model, sorting, filtering, aggregates, formula-safe CSV and view composition. Pure TypeScript with no DOM or React dependency. */
export { PROPERTY_TYPES, isPropertyType, isEmptyValue, displayText, numericValue, isIsoDate, isoDayOf, safeLinkHref, cellOf, indexProperties, convertValue, } from './properties.js';
export { sortRows } from './sort.js';
export { filterRows, OPERATORS_BY_TYPE } from './filter.js';
export { AGGREGATE_KINDS, aggregateValues, aggregateColumn } from './aggregate.js';

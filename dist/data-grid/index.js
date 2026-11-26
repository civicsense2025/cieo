/* Data grid logic: property model, sorting, filtering, aggregates, formula-safe CSV and view composition. Pure TypeScript with no DOM or React dependency. */
export { PROPERTY_TYPES, isPropertyType, isEmptyValue, displayText, numericValue, isIsoDate, isoDayOf, safeLinkHref, cellOf, indexProperties, convertValue, } from './properties.js';
export { sortRows } from './sort.js';
export { filterRows, OPERATORS_BY_TYPE } from './filter.js';
export { newFilterRule, changeRuleProperty, takesValue, valueInputFor, focusIndexAfterRemove } from './rules.js';
export { AGGREGATE_KINDS, aggregateValues, aggregateColumn } from './aggregate.js';
export { startsAsFormula, neutralizeFormula, restoreFormula } from './formula.js';
export { parseCsv } from './csv-parse.js';
export { exportCsv } from './csv-export.js';
export { importCsv, CSV_IMPORT_LIMITS } from './csv-import.js';
export { applyView } from './view.js';

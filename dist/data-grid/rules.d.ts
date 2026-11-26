import { type FilterOperator, type FilterRule } from './filter.js';
import type { PropertyDef } from './properties.js';
/** Whether an operator compares against a typed value. */
export declare function takesValue(operator: FilterOperator): boolean;
/** The control a rule's value takes: a text, number or date field, a choice from the property's options, or nothing. */
export type ValueInput = 'none' | 'text' | 'number' | 'date' | 'choice';
/** The value input that matches a property type and operator. A missing property takes none. */
export declare function valueInputFor(def: PropertyDef | undefined, operator: FilterOperator): ValueInput;
/** A new rule: the first property, its first operator, and no value. Undefined when there is no property to filter by. */
export declare function newFilterRule(properties: readonly PropertyDef[]): FilterRule | undefined;
export declare function changeRuleProperty(rule: FilterRule, properties: readonly PropertyDef[], propertyId: string): FilterRule;
/** The row that takes focus after a removal: the row that moves into the removed slot, or the last row. Null when none is left, so focus goes to the add control. */
export declare function focusIndexAfterRemove(removedIndex: number, remainingCount: number): number | null;

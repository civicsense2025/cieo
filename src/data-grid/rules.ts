/* Rule editing for filter builders: a new rule, a property change, the value input a rule takes, and the row that takes focus after a removal. Pure TypeScript. */
import { OPERATORS_BY_TYPE, type FilterOperator, type FilterRule } from './filter.js';
import type { PropertyDef } from './properties.js';

/* Operators that compare nothing. A rule with one takes no typed value, so a checkbox rule is complete as soon as it has one. */
const VALUELESS = new Set<FilterOperator>(['isEmpty', 'isNotEmpty', 'checked', 'unchecked']);

/** Whether an operator compares against a typed value. */
export function takesValue(operator: FilterOperator): boolean {
  return !VALUELESS.has(operator);
}

/** The control a rule's value takes: a text, number or date field, a choice from the property's options, or nothing. */
export type ValueInput = 'none' | 'text' | 'number' | 'date' | 'choice';

/** The value input that matches a property type and operator. A missing property takes none. */
export function valueInputFor(def: PropertyDef | undefined, operator: FilterOperator): ValueInput {
  if (!def || !takesValue(operator)) return 'none';
  switch (def.type) {
    case 'number': return 'number';
    case 'date': return 'date';
    case 'select':
    case 'status': return 'choice';
    case 'checkbox': return 'none';
    default: return 'text';
  }
}

/** A new rule: the first property, its first operator, and no value. Undefined when there is no property to filter by. */
export function newFilterRule(properties: readonly PropertyDef[]): FilterRule | undefined {
  const first = properties[0];
  return first ? { property: first.id, operator: OPERATORS_BY_TYPE[first.type][0] } : undefined;
}

/* A rule moved to another property keeps its operator when the new type offers it, and keeps its value only when the type stays the same. An unknown property only renames the rule. */
export function changeRuleProperty(rule: FilterRule, properties: readonly PropertyDef[], propertyId: string): FilterRule {
  const next = properties.find((def) => def.id === propertyId);
  if (!next) return { ...rule, property: propertyId };
  const previous = properties.find((def) => def.id === rule.property);
  const offered = OPERATORS_BY_TYPE[next.type];
  const base: FilterRule = { property: next.id, operator: offered.includes(rule.operator) ? rule.operator : offered[0] };
  return previous?.type === next.type && rule.value !== undefined ? { ...base, value: rule.value } : base;
}

/** The row that takes focus after a removal: the row that moves into the removed slot, or the last row. Null when none is left, so focus goes to the add control. */
export function focusIndexAfterRemove(removedIndex: number, remainingCount: number): number | null {
  return remainingCount > 0 ? Math.min(removedIndex, remainingCount - 1) : null;
}

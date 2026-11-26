'use client';
// src/primitives/FilterBuilder/FilterBuilder.tsx
import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  OPERATORS_BY_TYPE, changeRuleProperty, focusIndexAfterRemove, indexProperties, newFilterRule, valueInputFor,
  type FilterOperator, type FilterRule, type PropertyDef,
} from '../../data-grid/index.js';
import { Button } from '../../controls/Button.js';
import { Select, type SelectOption } from '../../controls/Select.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* FilterBuilder. Inline rule rows that filter a table: a property, an operator and a value per rule, with add and remove. Controlled by value and onChange; the data grid evaluates the rules. */

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* Display text per operator. Which operators a property offers comes from the data grid, never from this map. */
const OPERATOR_LABELS: Readonly<Record<FilterOperator, string>> = {
  contains: 'Contains',
  is: 'Is',
  isNot: 'Is not',
  isEmpty: 'Is empty',
  isNotEmpty: 'Is not empty',
  eq: 'Equals',
  ne: 'Does not equal',
  gt: 'Greater than',
  lt: 'Less than',
  gte: 'Greater than or equal to',
  lte: 'Less than or equal to',
  before: 'Is before',
  after: 'Is after',
  checked: 'Is checked',
  unchecked: 'Is unchecked',
};

/* The property select's combobox in a rule. Rules are found by class, not by data attributes, which the customization contract keeps for hosts. */
function propertyComboboxOf(root: HTMLElement, index: number): HTMLElement | null {
  return root.querySelectorAll<HTMLElement>('.cieo-filter-builder-rule')[index]?.querySelector<HTMLElement>('[role="combobox"]') ?? null;
}

export interface FilterBuilderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** The properties a rule can filter by, as the table schema defines them. Property ids must be unique. */
  properties: readonly PropertyDef[];
  /** The rules in order. Every rule must hold for a row. Unfinished rules stay in the list and hide nothing. */
  value: readonly FilterRule[];
  /** Called with the next rule list after a rule is added, changed or removed. */
  onChange: (rules: FilterRule[]) => void;
  /** Accessible name of the group. Defaults to Filters. */
  label?: string;
  /** Text shown when there are no rules. Defaults to "No filters. Every row is shown." */
  emptyLabel?: string;
  /** Text of the add control. Defaults to Add filter. */
  addLabel?: string;
  /** Replaces the display text of some operators, for example when the app is localized. */
  operatorLabels?: Partial<Readonly<Record<FilterOperator, string>>>;
}

export function FilterBuilder({
  className, slotProps, properties, value, onChange,
  label = 'Filters', emptyLabel = 'No filters. Every row is shown.', addLabel = 'Add filter', operatorLabels,
}: FilterBuilderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Set by an add or a remove and read once the new rule list has rendered: a row index, or 'add' for the add control.
  const focusRef = useRef<number | 'add' | null>(null);
  const byId = indexProperties(properties);
  const operatorText = (op: FilterOperator) => operatorLabels?.[op] ?? OPERATOR_LABELS[op];

  useIso(() => {
    const target = focusRef.current;
    const root = rootRef.current;
    if (target === null || !root) return;
    focusRef.current = null;
    // A select swaps its native control for a combobox after its first render, which can take a frame or two, so focus waits for it.
    const focusWhenReady = (framesLeft: number) => {
      const control = target === 'add' ? root.querySelector<HTMLElement>('.cieo-filter-builder-add') : propertyComboboxOf(root, target);
      if (control) control.focus();
      else if (framesLeft > 0) requestAnimationFrame(() => focusWhenReady(framesLeft - 1));
    };
    focusWhenReady(30);
  }, [value]);

  const replaceAt = (index: number, rule: FilterRule) => onChange(value.map((current, i) => (i === index ? rule : current)));

  const add = () => {
    const rule = newFilterRule(properties);
    if (!rule) return;
    focusRef.current = value.length;
    onChange([...value, rule]);
  };

  const remove = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    focusRef.current = focusIndexAfterRemove(index, next.length) ?? 'add';
    onChange(next);
  };

  const propertyChoices = (rule: FilterRule): SelectOption[] => {
    const choices = properties.map((def) => ({ value: def.id, label: def.name }));
    return byId.has(rule.property) ? choices : [{ value: rule.property, label: 'Unknown property' }, ...choices];
  };

  const operatorChoices = (rule: FilterRule, def: PropertyDef | undefined): SelectOption[] => {
    const offered: readonly FilterOperator[] = def ? OPERATORS_BY_TYPE[def.type] : [];
    const ops = offered.includes(rule.operator) ? offered : [rule.operator, ...offered];
    return ops.map((op) => ({ value: op, label: operatorText(op) }));
  };

  // The empty first choice keeps an unfinished rule showing "Choose a value" instead of the first option.
  const choiceOptions = (def: PropertyDef, rule: FilterRule): SelectOption[] => {
    const options = def.options ?? [];
    const stored = rule.value ?? '';
    const extra = stored !== '' && !options.includes(stored) ? [stored] : [];
    return [{ value: '', label: 'Choose a value' }, ...[...options, ...extra].map((option) => ({ value: option, label: option }))];
  };

  const valueControl = (index: number, rule: FilterRule, def: PropertyDef | undefined) => {
    if (!def) return null;
    const name = `Filter ${index + 1} value`;
    const kind = valueInputFor(def, rule.operator);
    if (kind === 'none') return null;
    if (kind === 'choice') {
      return (
        <Select
          label={name}
          hideLabel
          options={choiceOptions(def, rule)}
          value={rule.value ?? ''}
          onValueChange={(next) => replaceAt(index, { ...rule, value: next })}
        />
      );
    }
    return (
      <input
        className="cieo cieo-input cieo-filter-builder-value"
        type={kind}
        step={kind === 'number' ? 'any' : undefined}
        aria-label={name}
        value={rule.value ?? ''}
        onChange={(event) => replaceAt(index, { ...rule, value: event.currentTarget.value })}
      />
    );
  };

  const rows = value.map((rule, index) => {
    const def = byId.get(rule.property);
    const n = index + 1;
    return (
      <li key={index} className="cieo-filter-builder-rule">
        <Select
          label={`Filter ${n} property`}
          hideLabel
          options={propertyChoices(rule)}
          value={rule.property}
          onValueChange={(id) => replaceAt(index, changeRuleProperty(rule, properties, id))}
        />
        <Select
          label={`Filter ${n} operator`}
          hideLabel
          options={operatorChoices(rule, def)}
          value={rule.operator}
          onValueChange={(op) => replaceAt(index, { ...rule, operator: op as FilterOperator })}
        />
        {valueControl(index, rule, def)}
        <Button type="button" variant="ghost" size="sm" aria-label={`Remove filter ${n}`} onClick={() => remove(index)}>
          Remove
        </Button>
      </li>
    );
  });

  return (
    <div ref={rootRef} role="group" aria-label={label} className="cieo cieo-filter-builder" {...customizePart(slotProps?.root, 'cieo cieo-filter-builder', undefined, className)}>
      {value.length > 0 ? (
        <ol role="list" className="cieo-filter-builder-rules">{rows}</ol>
      ) : (
        <p className="cieo-filter-builder-empty">{emptyLabel}</p>
      )}
      {properties.length > 0 ? (
        <Button type="button" variant="secondary" size="sm" className="cieo-filter-builder-add" onClick={add}>
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}

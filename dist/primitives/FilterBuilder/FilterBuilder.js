'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/primitives/FilterBuilder/FilterBuilder.tsx
import { useEffect, useLayoutEffect, useRef } from 'react';
import { OPERATORS_BY_TYPE, changeRuleProperty, focusIndexAfterRemove, indexProperties, newFilterRule, valueInputFor, } from '../../data-grid/index.js';
import { Button } from '../../controls/Button.js';
import { Select } from '../../controls/Select.js';
import { customizePart } from '../customization.js';
/* FilterBuilder. Inline rule rows that filter a table: a property, an operator and a value per rule, with add and remove. Controlled by value and onChange; the data grid evaluates the rules. */
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
/* Display text per operator. Which operators a property offers comes from the data grid, never from this map. */
const OPERATOR_LABELS = {
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
/* The first control of a rule: the combobox trigger of an enhanced select, otherwise the first native control. Rules and the add control are found by class, not by data attributes, which the customization contract keeps for hosts. */
function firstControlOf(root, index) {
    const row = root.querySelectorAll('.cieo-filter-builder-rule')[index];
    return row?.querySelector('[role="combobox"]') ?? row?.querySelector('select, input, button') ?? null;
}
export function FilterBuilder({ className, slotProps, properties, value, onChange, label = 'Filters', emptyLabel = 'No filters. Every row is shown.', addLabel = 'Add filter', operatorLabels, }) {
    const rootRef = useRef(null);
    // Set by an add or a remove and read once the new rule list has rendered: a row index, or 'add' for the add control.
    const focusRef = useRef(null);
    const byId = indexProperties(properties);
    const operatorText = (op) => operatorLabels?.[op] ?? OPERATOR_LABELS[op];
    useIso(() => {
        const target = focusRef.current;
        const root = rootRef.current;
        if (target === null || !root)
            return;
        focusRef.current = null;
        const el = target === 'add' ? root.querySelector('.cieo-filter-builder-add') : firstControlOf(root, target);
        el?.focus();
    }, [value]);
    const replaceAt = (index, rule) => onChange(value.map((current, i) => (i === index ? rule : current)));
    const add = () => {
        const rule = newFilterRule(properties);
        if (!rule)
            return;
        focusRef.current = value.length;
        onChange([...value, rule]);
    };
    const remove = (index) => {
        const next = value.filter((_, i) => i !== index);
        focusRef.current = focusIndexAfterRemove(index, next.length) ?? 'add';
        onChange(next);
    };
    const propertyChoices = (rule) => {
        const choices = properties.map((def) => ({ value: def.id, label: def.name }));
        return byId.has(rule.property) ? choices : [{ value: rule.property, label: 'Unknown property' }, ...choices];
    };
    const operatorChoices = (rule, def) => {
        const offered = def ? OPERATORS_BY_TYPE[def.type] : [];
        const ops = offered.includes(rule.operator) ? offered : [rule.operator, ...offered];
        return ops.map((op) => ({ value: op, label: operatorText(op) }));
    };
    // The empty first choice keeps an unfinished rule showing "Choose a value" instead of the first option.
    const choiceOptions = (def, rule) => {
        const options = def.options ?? [];
        const stored = rule.value ?? '';
        const extra = stored !== '' && !options.includes(stored) ? [stored] : [];
        return [{ value: '', label: 'Choose a value' }, ...[...options, ...extra].map((option) => ({ value: option, label: option }))];
    };
    const valueControl = (index, rule, def) => {
        if (!def)
            return null;
        const name = `Filter ${index + 1} value`;
        const kind = valueInputFor(def, rule.operator);
        if (kind === 'none')
            return null;
        if (kind === 'choice') {
            return (_jsx(Select, { label: name, hideLabel: true, options: choiceOptions(def, rule), value: rule.value ?? '', onValueChange: (next) => replaceAt(index, { ...rule, value: next }) }));
        }
        return (_jsx("input", { className: "cieo cieo-input cieo-filter-builder-value", type: kind, step: kind === 'number' ? 'any' : undefined, "aria-label": name, value: rule.value ?? '', onChange: (event) => replaceAt(index, { ...rule, value: event.currentTarget.value }) }));
    };
    const rows = value.map((rule, index) => {
        const def = byId.get(rule.property);
        const n = index + 1;
        return (_jsxs("li", { className: "cieo-filter-builder-rule", children: [_jsx(Select, { label: `Filter ${n} property`, hideLabel: true, options: propertyChoices(rule), value: rule.property, onValueChange: (id) => replaceAt(index, changeRuleProperty(rule, properties, id)) }), _jsx(Select, { label: `Filter ${n} operator`, hideLabel: true, options: operatorChoices(rule, def), value: rule.operator, onValueChange: (op) => replaceAt(index, { ...rule, operator: op }) }), valueControl(index, rule, def), _jsx(Button, { type: "button", variant: "ghost", size: "sm", "aria-label": `Remove filter ${n}`, onClick: () => remove(index), children: "Remove" })] }, index));
    });
    return (_jsxs("div", { ref: rootRef, role: "group", "aria-label": label, ...customizePart(slotProps?.root, 'cieo cieo-filter-builder', undefined, className), children: [value.length > 0 ? (_jsx("ol", { role: "list", className: "cieo-filter-builder-rules", children: rows })) : (_jsx("p", { className: "cieo-filter-builder-empty", children: emptyLabel })), properties.length > 0 ? (_jsx(Button, { type: "button", variant: "secondary", size: "sm", className: "cieo-filter-builder-add", onClick: add, children: addLabel })) : null] }));
}

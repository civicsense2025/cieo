import { type FilterOperator, type FilterRule, type PropertyDef } from '../../data-grid/index.js';
import type { PrimitivePartProps } from '../parts.js';
export interface FilterBuilderProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
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
export declare function FilterBuilder({ className, slotProps, properties, value, onChange, label, emptyLabel, addLabel, operatorLabels, }: FilterBuilderProps): import("react/jsx-runtime").JSX.Element;

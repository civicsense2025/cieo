import { type ReactNode } from 'react';
import { type ControlSize } from './classes.js';
import { type SelectOption } from './native.js';
export type { SelectOption };
export interface SelectProps {
    /** Visible label (required: it names both the native select and the combobox). */
    label: ReactNode;
    /** Keeps the label for assistive tech but hides it visually. */
    hideLabel?: boolean;
    options: ReadonlyArray<SelectOption | string>;
    name?: string;
    id?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Submit the owning form after each pick (filter dropdowns in GET forms). Keep a submit button for no-JS. */
    autoSubmit?: boolean;
    /** Associates the native select with a form elsewhere on the page. */
    form?: string;
    disabled?: boolean;
    required?: boolean;
    size?: ControlSize;
    description?: ReactNode;
    className?: string;
}
export declare function Select(props: SelectProps): import("react/jsx-runtime").JSX.Element;

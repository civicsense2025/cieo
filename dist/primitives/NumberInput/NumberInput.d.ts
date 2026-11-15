import type { PrimitivePartProps } from '../parts.js';
export interface NumberInputProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        label?: PrimitivePartProps;
        input?: PrimitivePartProps;
        unit?: PrimitivePartProps;
    };
    label: string;
    min?: number;
    max?: number;
    step?: number;
    /** Unit shown after the input (e.g. "px", "%"). Name the unit in the label as well. */
    unit?: string;
    defaultValue?: number;
    /** Controlled value; null shows an empty field. */
    value?: number | null;
    /** Form field name. */
    name?: string;
    disabled?: boolean;
    required?: boolean;
    /** Called with the parsed number, or null when emptied. */
    onChange?: (value: number | null) => void;
}
export declare function NumberInput({ className, slotProps, label, min, max, step, unit, defaultValue, value, name, disabled, required, onChange }: NumberInputProps): import("react/jsx-runtime").JSX.Element;

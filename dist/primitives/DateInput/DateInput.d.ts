import type { PrimitivePartProps } from '../parts.js';
export interface DateInputProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        label?: PrimitivePartProps;
        input?: PrimitivePartProps;
    };
    label: string;
    /** Form field name. */
    name?: string;
    /** Controlled value (ISO string). */
    value?: string;
    /** Initial value when uncontrolled. */
    defaultValue?: string;
    /** Called with the new value string. */
    onChange?: (value: string) => void;
    min?: string;
    max?: string;
    disabled?: boolean;
    required?: boolean;
}
export declare function DateInput({ className, slotProps, label, name, value, defaultValue, onChange, min, max, disabled, required }: DateInputProps): import("react/jsx-runtime").JSX.Element;

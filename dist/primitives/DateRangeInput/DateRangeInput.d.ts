import type { PrimitivePartProps } from '../parts.js';
export interface DateRange {
    start: string;
    end: string;
}
export interface DateRangeInputProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        startField?: PrimitivePartProps;
        startLabel?: PrimitivePartProps;
        startInput?: PrimitivePartProps;
        endField?: PrimitivePartProps;
        endLabel?: PrimitivePartProps;
        endInput?: PrimitivePartProps;
    };
    label: string;
    /** Controlled range (ISO date strings, empty string when unset). */
    value?: DateRange;
    /** Initial range when uncontrolled. */
    defaultValue?: DateRange;
    /** Called with the next range after either end changes. */
    onChange?: (range: DateRange) => void;
    disabled?: boolean;
}
export declare function DateRangeInput({ className, slotProps, label, value, defaultValue, onChange, disabled }: DateRangeInputProps): import("react/jsx-runtime").JSX.Element;

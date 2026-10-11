export interface NumberInputProps {
    /** Visible label for the field (e.g. "Quantity"). Required. */
    label: string;
    /** Minimum value. Optional. */
    min?: number;
    /** Maximum value. Optional. */
    max?: number;
    /** Step between values. Optional. */
    step?: number;
    /** Initial value (uncontrolled). Optional. */
    defaultValue?: number;
}
export declare function NumberInput({ label, min, max, step, defaultValue }: NumberInputProps): import("react/jsx-runtime").JSX.Element;

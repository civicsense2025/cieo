export interface NumberInputProps {
    label: string;
    min?: number;
    max?: number;
    step?: number;
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
export declare function NumberInput({ label, min, max, step, defaultValue, value, name, disabled, required, onChange }: NumberInputProps): import("react/jsx-runtime").JSX.Element;

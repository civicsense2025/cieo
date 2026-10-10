export interface SelectorOptionProps {
    /** Submitted value. Required. */
    value: string;
    /** Visible text. Defaults to the value. */
    label?: string;
    /** Whether the option is unavailable. Defaults to false. */
    disabled?: boolean;
}
export declare function SelectorOption({ value, label, disabled }: SelectorOptionProps): import("react/jsx-runtime").JSX.Element;

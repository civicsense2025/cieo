export interface ComplexSelectorSection {
    label: string;
    options: Array<{
        value: string;
        label?: string;
    }>;
}
export interface ComplexSelectorProps {
    /** Visible label naming the field. Required. */
    label: string;
    /** Grouped sections rendered as optgroups. Required. */
    sections: ComplexSelectorSection[];
    /** Controlled value. */
    value?: string;
    /** Initial value when uncontrolled. */
    defaultValue?: string;
    /** Called with the chosen option value. */
    onChange?: (value: string) => void;
    /** Form field name. */
    name?: string;
    disabled?: boolean;
}
export declare function ComplexSelector({ label, sections, value, defaultValue, onChange, name, disabled }: ComplexSelectorProps): import("react/jsx-runtime").JSX.Element;

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
}
export declare function ComplexSelector({ label, sections }: ComplexSelectorProps): import("react/jsx-runtime").JSX.Element;

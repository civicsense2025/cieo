import { type ReactNode } from 'react';
export interface TypeaheadProps {
    /** Visible label naming the field. Required. */
    label: string;
    /** Current text. Optional. */
    value?: string;
    /** Host text hook. Optional. */
    onChange?: (value: string) => void;
    /** Whether the match list shows; host sets from match presence. Optional. */
    open?: boolean;
    children: ReactNode;
}
export declare function Typeahead({ label, value, onChange, open, children }: TypeaheadProps): import("react/jsx-runtime").JSX.Element;

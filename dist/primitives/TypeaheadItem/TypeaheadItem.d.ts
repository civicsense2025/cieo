import type { ReactNode } from 'react';
export interface TypeaheadItemProps {
    /** Stable match value passed back to onSelect. Required. */
    value: string;
    /** Host pick hook. Optional. */
    /** Marks the option as the active choice. Defaults to false. */
    selected?: boolean;
    onSelect?: (value: string) => void;
    children: ReactNode;
}
export declare function TypeaheadItem({ value, selected, onSelect, children }: TypeaheadItemProps): import("react/jsx-runtime").JSX.Element;

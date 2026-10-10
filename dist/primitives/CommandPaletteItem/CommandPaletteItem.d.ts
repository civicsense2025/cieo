import type { ReactNode } from 'react';
export interface CommandPaletteItemProps {
    /** Stable command value passed back to onSelect. Required. */
    value: string;
    /** Whether this item is the active match. Defaults to false. */
    selected?: boolean;
    /** Host pick hook. Optional. */
    onSelect?: (value: string) => void;
    children: ReactNode;
}
export declare function CommandPaletteItem({ value, selected, onSelect, children }: CommandPaletteItemProps): import("react/jsx-runtime").JSX.Element;

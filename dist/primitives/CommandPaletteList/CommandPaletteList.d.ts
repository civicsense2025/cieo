import type { ReactNode } from 'react';
export interface CommandPaletteListProps {
    /** Accessible name for the option list. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function CommandPaletteList({ label, children }: CommandPaletteListProps): import("react/jsx-runtime").JSX.Element;

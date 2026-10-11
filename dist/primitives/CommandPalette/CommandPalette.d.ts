import type { ReactNode } from 'react';
export interface CommandPaletteProps {
    /** Accessible name for the palette (e.g. "Site commands"). Required. */
    label: string;
    /** Current filter text, owned by the host. Optional. */
    query?: string;
    /** Host filter hook, wired to CommandPaletteInput onChange. Optional. */
    onQueryChange?: (query: string) => void;
    children: ReactNode;
}
export declare function CommandPalette({ label, query, children }: CommandPaletteProps): import("react/jsx-runtime").JSX.Element;

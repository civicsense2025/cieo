import type { ReactNode } from 'react';
export interface CommandPaletteGroupProps {
    /** Group heading (e.g. "Pages"). Optional. */
    label?: string;
    children: ReactNode;
}
export declare function CommandPaletteGroup({ label, children }: CommandPaletteGroupProps): import("react/jsx-runtime").JSX.Element;

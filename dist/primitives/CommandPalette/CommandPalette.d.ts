import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface CommandPaletteContextValue {
    query?: string;
    onQueryChange?: (query: string) => void;
}
export declare const CommandPaletteContext: import("react").Context<CommandPaletteContextValue | null>;
export interface CommandPaletteProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the palette (e.g. "Site commands"). Required. */
    label: string;
    /** Current filter text, owned by the host. Optional. */
    query?: string;
    /** Host filter hook; reaches CommandPaletteInput when it has no onChange of its own. Optional. */
    onQueryChange?: (query: string) => void;
    /** Called on Escape. Optional. */
    onClose?: () => void;
    /** Called with 1 or -1 on ArrowDown or ArrowUp when the host tracks the active item. Without it focus moves between options. */
    onNavigate?: (delta: 1 | -1) => void;
    /** Called on Enter in the input when the host tracks the active item. Optional. */
    onActivate?: () => void;
    children: ReactNode;
}
export declare function CommandPalette({ className, slotProps, label, query, onQueryChange, onClose, onNavigate, onActivate, children }: CommandPaletteProps): import("react/jsx-runtime").JSX.Element;

import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
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
    /** Controlled open state. Defaults to true when omitted so standalone mounts render open. */
    open?: boolean;
    /** Initial open state when uncontrolled. Defaults to true. */
    defaultOpen?: boolean;
    /** Called with the next open state. */
    onOpenChange?: (open: boolean) => void;
    /** Current filter text when controlled. Optional. */
    query?: string;
    /** Initial filter text when uncontrolled. Optional. */
    defaultQuery?: string;
    /** Host filter hook; reaches CommandPaletteInput when it has no onChange of its own. Optional. */
    onQueryChange?: (query: string) => void;
    /** Called on Escape. Optional. */
    onClose?: () => void;
    /** Called with 1 or -1 on ArrowDown or ArrowUp when the host tracks the active item. Without it focus moves between options. */
    onNavigate?: (delta: 1 | -1) => void;
    /** Called on Enter in the input when the host tracks the active item. Optional. */
    onActivate?: () => void;
    /** False disables spring enter/exit. Defaults to true. */
    motion?: boolean;
    children: ReactNode;
}
export declare function CommandPalette({ className, slotProps, label, open: openProp, defaultOpen, onOpenChange, query: queryProp, defaultQuery, onQueryChange, onClose, onNavigate, onActivate, motion, children, }: CommandPaletteProps): import("react/jsx-runtime").JSX.Element | null;

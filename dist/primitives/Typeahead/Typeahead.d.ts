import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface TypeaheadProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        input?: PrimitivePartProps;
        list?: PrimitivePartProps;
    };
    /** Visible label naming the field. Required. */
    label: string;
    /** Current text. Optional. */
    value?: string;
    /** Host text hook. Optional. */
    onChange?: (value: string) => void;
    /** Whether the match list shows; host sets from match presence. Optional. */
    open?: boolean;
    /** Asks the host to open or close the list (Escape closes, ArrowDown opens). Optional. */
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}
export declare function Typeahead({ className, slotProps, label, value, onChange, open, onOpenChange, children }: TypeaheadProps): import("react/jsx-runtime").JSX.Element;

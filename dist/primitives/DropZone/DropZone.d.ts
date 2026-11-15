import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface DropZoneProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        button?: PrimitivePartProps;
        input?: PrimitivePartProps;
        hint?: PrimitivePartProps;
        error?: PrimitivePartProps;
    };
    /** Accessible name for the drop region (e.g. "Source image"). Required. */
    label: string;
    /** Text of the explicit Choose button (e.g. "Choose image"). Required. */
    chooseLabel: string;
    /** Formats and limits line (e.g. "PNG or JPEG · 25 MB max"). */
    hint?: string;
    /** File dialog filter. Defaults to images. */
    accept?: string;
    /** Allow more than one file. Defaults to false. */
    multiple?: boolean;
    /** Disables the button, the input, and dropping. */
    disabled?: boolean;
    /** Error message; marks the zone and announces once via role=alert. */
    error?: string;
    /** Called with the dropped or chosen files. Host clears error state on success. */
    onFiles?: (files: File[]) => void;
    /** Illustration or promise copy above the button. */
    children?: ReactNode;
}
export declare function DropZone({ className, slotProps, label, chooseLabel, hint, accept, multiple, disabled, error, onFiles, children }: DropZoneProps): import("react/jsx-runtime").JSX.Element;

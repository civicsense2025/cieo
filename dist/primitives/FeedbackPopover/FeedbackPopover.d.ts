import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export type PopoverSide = 'right' | 'left' | 'below' | 'above';
export interface PopoverPlacement {
    left: number;
    top: number;
    side: PopoverSide;
}
/** Where a popover of `size` goes beside `anchor` inside `container` (all px). Prefers right, then left, below, above; when none fits it takes the side with the most room. The result is always clamped inside the container. */
export declare function placePopover(anchor: {
    x: number;
    y: number;
}, size: {
    width: number;
    height: number;
}, container: {
    width: number;
    height: number;
}, gap?: number): PopoverPlacement;
/** True when the keydown should submit: Enter with Cmd or Ctrl held. */
export declare function isSubmitShortcut(e: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
}): boolean;
/** Text to hand to onSubmit, or null when there is nothing but whitespace. */
export declare function commentText(raw: string): string | null;
export interface FeedbackPopoverProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
        thread?: PrimitivePartProps;
        field?: PrimitivePartProps;
        actions?: PrimitivePartProps;
        submit?: PrimitivePartProps;
    };
    /** Controlled open state. */
    open: boolean;
    /** Called with false on Escape, outside press, and after a successful submit. */
    onOpenChange: (open: boolean) => void;
    /** Called with the trimmed text on submit button or Cmd/Ctrl+Enter. Never called for empty text. */
    onSubmit: (text: string) => void;
    /** Placeholder for the text box. Defaults to "Add a comment". */
    placeholder?: string;
    /** Submit button text. Defaults to "Comment". */
    submitLabel?: string;
    /** Visible heading that also names the dialog. Omit for a headless box named by its placeholder. */
    title?: string;
    /** Existing thread, rendered above the box. */
    children?: ReactNode;
    /** Extra actions beside the submit button, such as Resolve. */
    secondaryActions?: ReactNode;
    /** Point to sit beside, in px within the positioned container. Omit to render in normal flow (the host positions it). */
    anchor?: {
        x: number;
        y: number;
    };
    /** Size of the positioned container in px, required with anchor for placement. */
    container?: {
        width: number;
        height: number;
    };
    /** Distance from the anchor in px. Defaults to 8. */
    gap?: number;
}
export declare function FeedbackPopover({ className, slotProps, open, onOpenChange, onSubmit, placeholder, submitLabel, title, children, secondaryActions, anchor, container, gap }: FeedbackPopoverProps): import("react/jsx-runtime").JSX.Element | null;

import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ChatComposerProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the composer form. Defaults to Send a message. */
    label?: string;
    /** Called after submit is intercepted. Host sends and clears. Optional. */
    onSubmit?: () => void;
    children: ReactNode;
}
export declare function ChatComposer({ className, slotProps, label, onSubmit, children }: ChatComposerProps): import("react/jsx-runtime").JSX.Element;

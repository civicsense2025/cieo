import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ChatMessageProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        author?: PrimitivePartProps;
        time?: PrimitivePartProps;
    };
    /** Message author name (e.g. "Ava"). Optional. */
    author?: string;
    /** Message timestamp (e.g. "9:41 AM"). Optional. */
    time?: string;
    children: ReactNode;
}
export declare function ChatMessage({ className, slotProps, author, time, children }: ChatMessageProps): import("react/jsx-runtime").JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ChatMessageListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the transcript. Defaults to Messages. */
    label?: string;
    children: ReactNode;
}
export declare function ChatMessageList({ label, children, className, slotProps }: ChatMessageListProps): import("react/jsx-runtime").JSX.Element;

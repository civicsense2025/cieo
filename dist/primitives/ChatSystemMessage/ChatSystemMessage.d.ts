import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ChatSystemMessageProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function ChatSystemMessage({ className, slotProps, children }: ChatSystemMessageProps): import("react/jsx-runtime").JSX.Element;

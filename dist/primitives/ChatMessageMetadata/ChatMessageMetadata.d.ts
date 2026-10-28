import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ChatMessageMetadataProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function ChatMessageMetadata({ className, slotProps, children }: ChatMessageMetadataProps): import("react/jsx-runtime").JSX.Element;

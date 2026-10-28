import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ChatLayoutProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        transcript?: PrimitivePartProps;
        rail?: PrimitivePartProps;
    };
    /** Transcript pane (list plus composer). Required. */
    children: ReactNode;
    /** Artifact panel beside the transcript. Omit for transcript only. */
    rail?: ReactNode;
}
export declare function ChatLayout({ children, rail, className, slotProps }: ChatLayoutProps): import("react/jsx-runtime").JSX.Element;

import type { ReactNode } from 'react';
export interface ChatLayoutProps {
    /** Transcript pane (list plus composer). Required. */
    children: ReactNode;
    /** Artifact panel beside the transcript. Omit for transcript only. */
    rail?: ReactNode;
}
export declare function ChatLayout({ children, rail }: ChatLayoutProps): import("react/jsx-runtime").JSX.Element;

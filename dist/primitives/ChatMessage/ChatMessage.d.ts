import type { ReactNode } from 'react';
export interface ChatMessageProps {
    /** Message author name (e.g. "Ava"). Optional. */
    author?: string;
    /** Message timestamp (e.g. "9:41 AM"). Optional. */
    time?: string;
    children: ReactNode;
}
export declare function ChatMessage({ author, time, children }: ChatMessageProps): import("react/jsx-runtime").JSX.Element;

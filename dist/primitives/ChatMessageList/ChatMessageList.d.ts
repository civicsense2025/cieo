import type { ReactNode } from 'react';
export interface ChatMessageListProps {
    /** Accessible name for the transcript. Defaults to Messages. */
    label?: string;
    children: ReactNode;
}
export declare function ChatMessageList({ label, children }: ChatMessageListProps): import("react/jsx-runtime").JSX.Element;

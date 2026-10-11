import type { ReactNode } from 'react';
export interface ChatComposerProps {
    /** Accessible name for the composer form. Defaults to Send a message. */
    label?: string;
    /** Called after submit is intercepted. Host sends and clears. Optional. */
    onSubmit?: () => void;
    children: ReactNode;
}
export declare function ChatComposer({ label, onSubmit, children }: ChatComposerProps): import("react/jsx-runtime").JSX.Element;

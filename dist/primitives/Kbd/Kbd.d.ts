import type { ReactNode } from 'react';
export interface KbdProps {
    /** Key names (e.g. ⌘, K). One chord per Kbd. */
    children: ReactNode;
}
export declare function Kbd({ children }: KbdProps): import("react/jsx-runtime").JSX.Element;

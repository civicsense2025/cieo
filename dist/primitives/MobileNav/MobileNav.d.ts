import type { ReactNode } from 'react';
export interface MobileNavProps {
    /** Accessible name for the drawer nav. Required. */
    label: string;
    /** Whether the drawer is open. Defaults to false. */
    open?: boolean;
    /** Close handler (e.g. close button, scrim). */
    onClose?: () => void;
    children: ReactNode;
}
export declare function MobileNav({ label, open, onClose, children }: MobileNavProps): import("react/jsx-runtime").JSX.Element | null;

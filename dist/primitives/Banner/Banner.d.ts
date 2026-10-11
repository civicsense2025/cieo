import type { ReactNode } from 'react';
export interface BannerProps {
    /** Notice severity. Defaults to info. */
    tone?: 'info' | 'success' | 'warning' | 'danger';
    /** Short headline. Omit for body-only notices. */
    title?: string;
    /** The notice body and any actions. */
    children: ReactNode;
}
export declare function Banner({ tone, title, children }: BannerProps): import("react/jsx-runtime").JSX.Element;

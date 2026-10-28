import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface BannerProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
        body?: PrimitivePartProps;
    };
    /** Notice severity. Defaults to info. */
    tone?: 'info' | 'success' | 'warning' | 'danger';
    /** Short headline. Omit for body-only notices. */
    title?: string;
    /** The notice body and any actions. */
    children: ReactNode;
}
export declare function Banner({ className, slotProps, tone, title, children }: BannerProps): import("react/jsx-runtime").JSX.Element;

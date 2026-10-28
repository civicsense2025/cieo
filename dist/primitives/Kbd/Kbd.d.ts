import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface KbdProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Key names (e.g. ⌘, K). One chord per Kbd. */
    children: ReactNode;
}
export declare function Kbd({ className, slotProps, children }: KbdProps): import("react/jsx-runtime").JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface NavHeadingMenuProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Visible heading and accessible name. Required. */
    label: string;
    children: ReactNode;
}
export declare function NavHeadingMenu({ className, slotProps, label, children }: NavHeadingMenuProps): import("react/jsx-runtime").JSX.Element;

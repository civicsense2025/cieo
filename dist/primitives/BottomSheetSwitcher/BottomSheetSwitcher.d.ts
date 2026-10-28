import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface BottomSheetSwitcherProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the option list (e.g. "Share options"). Required. */
    label: string;
    children: ReactNode;
}
export declare function BottomSheetSwitcher({ className, slotProps, label, children }: BottomSheetSwitcherProps): import("react/jsx-runtime").JSX.Element;

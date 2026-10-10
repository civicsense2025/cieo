import type { ReactNode } from 'react';
export interface BottomSheetSwitcherProps {
    /** Accessible name for the option list (e.g. "Share options"). Required. */
    label: string;
    children: ReactNode;
}
export declare function BottomSheetSwitcher({ label, children }: BottomSheetSwitcherProps): import("react/jsx-runtime").JSX.Element;

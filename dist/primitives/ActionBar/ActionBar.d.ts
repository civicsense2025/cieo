import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
/** Index a horizontal toolbar moves to for a key, or null when the key does nothing. Wraps at both ends. */
export declare function actionBarIndex(key: string, current: number, count: number): number | null;
export interface ActionBarProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the toolbar ("Post actions"). Required. */
    label: string;
    /** The buttons, in order. */
    children: ReactNode;
    /** Passed to the layout as data-size so buttons and gaps stay consistent. Defaults to md. */
    size?: 'sm' | 'md';
    /** start packs the buttons left; between spreads them across the row. Defaults to start. */
    align?: 'start' | 'between';
}
export declare function ActionBar({ className, slotProps, label, children, size, align }: ActionBarProps): import("react/jsx-runtime").JSX.Element;

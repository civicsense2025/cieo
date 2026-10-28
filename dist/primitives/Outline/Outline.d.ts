import type { PrimitivePartProps } from '../parts.js';
export interface OutlineItem {
    id: string;
    label: string;
}
export interface OutlineProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name. Defaults to On this page. */
    label?: string;
    /** Sections to link; each renders an anchor to its id. Required. */
    items: OutlineItem[];
}
export declare function Outline({ className, slotProps, label, items }: OutlineProps): import("react/jsx-runtime").JSX.Element;

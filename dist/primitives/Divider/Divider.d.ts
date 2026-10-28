import type { PrimitivePartProps } from '../parts.js';
export interface DividerProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    label?: string;
}
export declare function Divider({ className, slotProps, label }: DividerProps): import("react/jsx-runtime").JSX.Element;

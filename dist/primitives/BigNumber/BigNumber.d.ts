import type { PrimitivePartProps } from '../parts.js';
export interface BigNumberProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    value: string;
    label?: string;
    layout?: 'inline' | 'stacked';
}
export declare function BigNumber({ className, slotProps, value, label, layout }: BigNumberProps): import("react/jsx-runtime").JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface TooltipProps extends MotionProps {
    className?: string;
    slotProps?: {
        trigger?: PrimitivePartProps;
        root?: PrimitivePartProps;
        bubble?: PrimitivePartProps;
    };
    text: string;
    children: ReactNode;
}
export declare function Tooltip({ className, slotProps, text, children, motion, entering, exiting }: TooltipProps): import("react/jsx-runtime").JSX.Element;

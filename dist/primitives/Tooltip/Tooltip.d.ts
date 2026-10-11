import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface TooltipProps extends MotionProps {
    text: string;
    children: ReactNode;
}
export declare function Tooltip({ text, children, motion, entering, exiting }: TooltipProps): import("react/jsx-runtime").JSX.Element;

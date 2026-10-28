import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface HoverCardProps extends MotionProps {
    className?: string;
    slotProps?: {
        trigger?: PrimitivePartProps;
        root?: PrimitivePartProps;
        card?: PrimitivePartProps;
    };
    /** Card body shown on hover and focus. Required. */
    content: ReactNode;
    children: ReactNode;
}
export declare function HoverCard({ className, slotProps, content, children, motion, entering, exiting }: HoverCardProps): import("react/jsx-runtime").JSX.Element;

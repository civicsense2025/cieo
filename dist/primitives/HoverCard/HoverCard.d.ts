import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface HoverCardProps extends MotionProps {
    /** Card body shown on hover and focus. Required. */
    content: ReactNode;
    children: ReactNode;
}
export declare function HoverCard({ content, children, motion, entering, exiting }: HoverCardProps): import("react/jsx-runtime").JSX.Element;

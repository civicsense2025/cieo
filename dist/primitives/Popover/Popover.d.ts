import { type CSSProperties, type ReactNode } from 'react';
import type { PopoverAlign, PopoverSide } from './position.js';
import type { PrimitivePartProps as PartProps } from '../parts.js';
export interface PopoverProps {
    trigger: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: ReactNode;
    label?: string;
    side?: PopoverSide;
    align?: PopoverAlign;
    offset?: number;
    collisionPadding?: number;
    portal?: boolean;
    motion?: boolean;
    className?: string;
    style?: CSSProperties;
    slots?: {
        header?: ReactNode;
        content?: ReactNode;
        footer?: ReactNode;
    };
    slotProps?: {
        root?: PartProps;
        trigger?: PartProps;
        content?: PartProps;
    };
}
export declare function Popover({ trigger, open, defaultOpen, onOpenChange, children, label, side, align, offset, collisionPadding, portal, motion, className, style, slots, slotProps }: PopoverProps): import("react/jsx-runtime").JSX.Element;

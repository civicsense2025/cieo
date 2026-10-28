import { type RefObject } from 'react';
import { type PopoverPositionOptions } from './position.js';
export declare function usePopoverPosition(open: boolean, anchor: RefObject<HTMLElement | null>, panel: HTMLElement | null, options: PopoverPositionOptions): {
    x: number;
    y: number;
    side: import("./position.js").PopoverSide;
    maxWidth: number;
    maxHeight: number;
} | null;

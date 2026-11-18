import { type HTMLAttributes, type ReactNode, type Ref } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SlotProps extends HTMLAttributes<HTMLElement> {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** When true, the single child element replaces the wrapper, merging props. */
    asChild?: boolean;
    children?: ReactNode;
}
export declare function mergeRefs<T = unknown>(...refs: Array<Ref<T> | undefined | null>): Ref<T> | undefined;
export declare function mergeSlotProps(slotProps: Record<string, unknown>, childProps: Record<string, unknown>): Record<string, unknown>;
export declare const Slot: import("react").ForwardRefExoticComponent<SlotProps & import("react").RefAttributes<HTMLElement>>;

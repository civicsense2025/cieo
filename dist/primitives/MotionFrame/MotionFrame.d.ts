import { type ReactNode } from 'react';
import { type Preset, type SpringConfig } from '../../core/spring.js';
import type { PrimitivePartProps } from '../parts.js';
export interface MotionFrameProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        content?: PrimitivePartProps;
    };
    /** Key identifying the active content view; changes trigger height spring + directional arrival. */
    contentKey?: string | number;
    /** Shared-axis travel sign: 1 forward, -1 backward, 0 pure cross-arrival. Defaults to 0. */
    direction?: -1 | 0 | 1;
    /** Axis for directional swaps. Defaults to x. */
    axis?: 'x' | 'y';
    /** Distance in pixels for shared-axis slide. Defaults to 16. */
    distance?: number;
    /** Spring preset or config for height and arrival. Defaults to soft. */
    preset?: Preset | SpringConfig;
    /** False disables motion and snaps immediately. Defaults to true. */
    motion?: boolean;
    /** Alias to disable motion. Defaults to false. */
    disabled?: boolean;
    children: ReactNode;
}
export declare function MotionFrame({ className, slotProps, contentKey, direction, axis, distance, preset, motion, disabled, children, }: MotionFrameProps): import("react/jsx-runtime").JSX.Element;

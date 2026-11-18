import { type ReactNode } from 'react';
import { type Preset, type SpringConfig } from '../../core/spring.js';
import type { PrimitivePartProps } from '../parts.js';
/** Computes per-item stagger delays (in milliseconds) strictly bounded by `budgetMs`. */
export declare function computeStaggerDelays(count: number, stepMs?: number, budgetMs?: number): number[];
export interface StaggerGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Maximum total stagger window in milliseconds across all children. Defaults to 300. */
    budget?: number;
    /** Target delay step per item in milliseconds, compressed when needed to fit budget. Defaults to 40. */
    delay?: number;
    /** Vertical drift in pixels on arrival. Defaults to 6. */
    distance?: number;
    /** Spring preset or config. Defaults to base. */
    preset?: Preset | SpringConfig;
    /** Optional key that re-runs the staggered entrance when changed. */
    triggerKey?: string | number;
    /** False disables motion and renders end state immediately. Defaults to true. */
    motion?: boolean;
    /** Alias to disable motion. Defaults to false. */
    disabled?: boolean;
    children: ReactNode;
}
export declare function StaggerGroup({ className, slotProps, budget, delay, distance, preset, triggerKey, motion, disabled, children, }: StaggerGroupProps): import("react/jsx-runtime").JSX.Element;

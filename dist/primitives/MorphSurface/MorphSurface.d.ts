import { type ReactNode } from 'react';
import { type Preset, type SpringConfig } from '../../core/spring.js';
import { type RectGeometry } from '../../live/index.js';
import type { PrimitivePartProps } from '../parts.js';
export interface MorphSurfaceProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Shared Container Transform identifier across morph states or mounts. */
    layoutId: string;
    /** Optional state key; changing it triggers a same-element FLIP measurement and SpringRect retarget. */
    stateKey?: string | number | boolean;
    /** Optional explicit origin rect (e.g. from TransitionEnvelope.anchorRect). */
    anchorRect?: RectGeometry;
    /** Spring preset or config. Defaults to base. */
    preset?: Preset | SpringConfig;
    /** False disables motion and snaps immediately. Defaults to true. */
    motion?: boolean;
    /** Alias to disable motion. Defaults to false. */
    disabled?: boolean;
    children: ReactNode;
}
export declare function MorphSurface({ className, slotProps, layoutId, stateKey, anchorRect, preset, motion, disabled, children, }: MorphSurfaceProps): import("react/jsx-runtime").JSX.Element;

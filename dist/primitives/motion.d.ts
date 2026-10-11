export type MotionChoice = 'none' | 'fade' | 'rise' | 'scale';
export interface MotionProps {
    /** False renders the end state instantly. Defaults to true. */
    motion?: boolean;
    /** Entering behavior. Default is set per component. */
    entering?: MotionChoice;
    /** Exiting behavior. Defaults to the entering value. */
    exiting?: MotionChoice;
}
export interface MotionAttrs {
    'data-motion': 'on' | 'off';
    'data-entering'?: MotionChoice;
    'data-exiting'?: MotionChoice;
}
export declare function motionAttrs(o?: MotionProps): MotionAttrs;

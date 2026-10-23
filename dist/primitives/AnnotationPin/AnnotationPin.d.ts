export type AnnotationPinState = 'draft' | 'open' | 'resolved';
/** Accessible name: "Comment 3, open" or "Comment 3 by Ava, resolved". Index is clamped to a whole number of at least 1. */
export declare function annotationPinLabel(index: number, state?: AnnotationPinState, author?: string): string;
/** Clamps a layer coordinate to 0..1; NaN becomes 0. */
export declare function clampUnit(value: number): number;
export interface AnnotationPinProps {
    /** 1-based number drawn on the pin and spoken in its name. */
    index: number;
    /** Horizontal position as a 0..1 fraction of the layer. The tip lands here. */
    x: number;
    /** Vertical position as a 0..1 fraction of the layer. The tip lands here. */
    y: number;
    /** draft is the unsent pin, open has a live thread, resolved is muted and smaller. Defaults to open. */
    state?: AnnotationPinState;
    /** True while its thread is open: draws a focus-like ring. */
    selected?: boolean;
    /** Author name, added to the accessible name ("Comment 3 by Ava, resolved"). */
    label?: string;
    /** 1-3 characters drawn in place of the number, for pins that show who commented. */
    initials?: string;
    /** Called when the pin is pressed with a pointer, Enter or Space. */
    onSelect?: () => void;
}
export declare function AnnotationPin({ index, x, y, state, selected, label, initials, onSelect }: AnnotationPinProps): import("react/jsx-runtime").JSX.Element;

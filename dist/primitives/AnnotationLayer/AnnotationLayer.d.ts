import { type ReactNode } from 'react';
export interface LayerPoint {
    x: number;
    y: number;
}
export type AnnotationTarget = {
    kind: 'draft';
    x: number;
    y: number;
} | {
    kind: 'pin';
    id: string;
};
export interface AnnotationLayerPin {
    /** Stable id used by selectedId, onSelect and renderPopover. */
    id: string;
    /** Horizontal position, 0..1 of the layer. */
    x: number;
    /** Vertical position, 0..1 of the layer. */
    y: number;
    /** open (default) or resolved. */
    state?: 'open' | 'resolved';
    /** Author initials drawn on the pin. */
    initials?: string;
}
/** Click position as a 0..1 point of `rect`, clamped. A zero-size rect gives 0,0. */
export declare function normalizePoint(clientX: number, clientY: number, rect: {
    left: number;
    top: number;
    width: number;
    height: number;
}): LayerPoint;
/** Arrow key moves the reticle by step (big with Shift), clamped to 0..1. Returns null for any other key. */
export declare function moveReticle(point: LayerPoint, key: string, shift?: boolean, step?: number, big?: number): LayerPoint | null;
/** What Escape does in comment mode: cancel an open draft or thread first, otherwise leave comment mode. */
export declare function escapeAction(hasOpenTarget: boolean): 'close-target' | 'leave-mode';
export declare const COMMENT_MODE_ON = "Comment mode on. Click or press Enter to place a comment.";
export declare const COMMENT_MODE_OFF = "Comment mode off.";
export interface AnnotationLayerProps {
    /** Accessible name for the reviewed area, e.g. "Landing page". */
    label: string;
    /** The content being reviewed. */
    children: ReactNode;
    /** Existing pins, numbered 1..n in array order. */
    pins: AnnotationLayerPin[];
    /** True while comment mode is on: clicks place pins instead of reaching the content. */
    active: boolean;
    /** Called when Escape asks to leave comment mode. */
    onActiveChange?: (active: boolean) => void;
    /** Called with the normalized point for a click, Enter or Space in comment mode. The host creates the draft. */
    onPlace: (point: LayerPoint) => void;
    /** Id of the pin whose thread is open. */
    selectedId?: string | null;
    /** Called with a pin id on press, or null when the open thread or draft should close (Escape, outside press, pin pressed again). */
    onSelect: (id: string | null) => void;
    /** Content for the popover beside the draft or the selected pin; usually a FeedbackPopover without anchor. */
    renderPopover: (target: AnnotationTarget) => ReactNode;
    /** The unsent pin the host created after onPlace. */
    draft?: LayerPoint | null;
}
export declare function AnnotationLayer({ label, children, pins, active, onActiveChange, onPlace, selectedId, onSelect, renderPopover, draft }: AnnotationLayerProps): import("react/jsx-runtime").JSX.Element;

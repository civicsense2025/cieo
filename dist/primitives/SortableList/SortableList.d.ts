import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export type SortableListTag = 'ul' | 'ol' | 'div' | 'tbody';
/** Returns order with id moved to index (clamped). Returns the same array when nothing moves. */
export declare function sortableMove(order: readonly string[], id: string, index: number): readonly string[];
/** Target index for the dragged item: how many of the other items' midpoints the pointer has passed. */
export declare function sortableDropIndex(otherMidpoints: readonly number[], pointer: number): number;
export type SortableEvent = 'lift' | 'move' | 'drop' | 'cancel';
/** Screen-reader sentence for a reorder step; position is 1-based. */
export declare function sortableAnnouncement(event: SortableEvent, name: string, position: number, total: number): string;
export interface SortableSession {
    id: string;
    via: 'pointer' | 'keyboard';
    order: readonly string[];
}
export type SortableAction = {
    type: 'lift';
    id: string;
    via: 'pointer' | 'keyboard';
} | {
    type: 'moveTo';
    index: number;
} | {
    type: 'moveBy';
    delta: number;
} | {
    type: 'drop';
} | {
    type: 'cancel';
};
export interface SortableStep {
    session: SortableSession | null;
    event: SortableEvent | null;
    /** Order to hand to onReorder; set only when a drop changed something. */
    commit: readonly string[] | null;
    /** Item the step is about, for announcements. */
    id: string | null;
    /** The order the announcement position refers to. */
    order: readonly string[];
}
/** Keyboard key to action while an item is lifted; null for keys that do nothing. */
export declare function sortableKeyAction(key: string): SortableAction | null;
/** Pure reorder state machine. `original` is the host's order; the session holds the live preview. */
export declare function sortableStep(session: SortableSession | null, action: SortableAction, original: readonly string[]): SortableStep;
export interface SortableListContextValue {
    as: SortableListTag;
    session: SortableSession | null;
    order: readonly string[];
    /** Applies an action to the reorder session; name is read aloud. */
    dispatch: (action: SortableAction, name: string) => void;
}
export declare const SortableListContext: import("react").Context<SortableListContextValue | null>;
export interface SortableListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the list (e.g. "Pipeline stages"). Required. */
    label: string;
    /** Item ids in display order. The list never reorders itself; it asks through onReorder. */
    order: string[];
    /** Called once with the next order when an item is dropped in a new place. */
    onReorder: (next: string[]) => void;
    /** Element to render: ul or ol for lists, div for generic rows, tbody for table rows. Defaults to ul. */
    as?: SortableListTag;
    /** Axis items travel along. Defaults to vertical. */
    orientation?: 'vertical' | 'horizontal';
    /** False skips the slide animation. Defaults to true; reduced-motion users never see it. */
    motion?: boolean;
    /** SortableListItem children, in any order; their ids and `order` decide where they appear. */
    children: ReactNode;
}
export declare function SortableList({ className, slotProps, label, order, onReorder, as, orientation, motion, children }: SortableListProps): import("react/jsx-runtime").JSX.Element;

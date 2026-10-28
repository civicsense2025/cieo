import type { PrimitivePartProps } from '../parts.js';
export interface Reaction {
    /** Stable id the host stores (never the emoji itself). */
    id: string;
    /** The emoji character shown. */
    emoji: string;
    /** Plain-words name; the accessible name of the button. */
    label: string;
}
/** The default set, in the order people reach for them. */
export declare const DEFAULT_REACTIONS: readonly Reaction[];
export interface ReactionPickerProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        item?: PrimitivePartProps;
        emoji?: PrimitivePartProps;
    };
    /** Called with the id of the reaction the person picked. */
    onPick(id: string): void;
    /** Reactions to offer. Defaults to DEFAULT_REACTIONS. */
    reactions?: readonly Reaction[];
    /** Accessible name of the toolbar. Defaults to "Add a reaction". */
    label?: string;
    /** Ids already chosen by this person; those buttons report aria-pressed. */
    selected?: readonly string[];
}
/** Index that holds the roving tab stop: the first selected reaction, else the first. */
export declare function pickerStartIndex(reactions: readonly Reaction[], selected?: readonly string[]): number;
export declare function ReactionPicker({ className, slotProps, onPick, reactions, label, selected }: ReactionPickerProps): import("react/jsx-runtime").JSX.Element;

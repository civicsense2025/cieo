import type { PrimitivePartProps } from '../parts.js';
import { type Reaction } from '../ReactionPicker/ReactionPicker.js';
export interface ReactionTally extends Reaction {
    /** How many people used this reaction. */
    count: number;
    /** True when the current person is one of them. */
    mine?: boolean;
}
/** Next list after the current person toggles `id`. Off decrements and drops the chip at 0; on increments, or appends a new chip (count 1, mine). Never mutates. */
export declare function toggleReaction(list: readonly ReactionTally[], id: string, emoji?: string, label?: string): ReactionTally[];
/** Accessible name of a chip: "Love, 3 people including you". */
export declare function reactionName(r: ReactionTally): string;
export interface ReactionSummaryProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        list?: PrimitivePartProps;
        slot?: PrimitivePartProps;
        chip?: PrimitivePartProps;
        emoji?: PrimitivePartProps;
        count?: PrimitivePartProps;
        add?: PrimitivePartProps;
    };
    /** The chips to show, in display order. */
    reactions: readonly ReactionTally[];
    /** Called with a chip's id when the person presses it. */
    onToggle(id: string): void;
    /** When given, an add-reaction button opens a picker; called with the picked id. */
    onAdd?: (id: string) => void;
    /** Reactions the picker offers. Defaults to DEFAULT_REACTIONS. */
    available?: readonly Reaction[];
}
/** Which ids are new since the last list, and which chips just left (with their old index). Pure so it can be tested. */
export declare function reactionDiff(prev: readonly ReactionTally[], next: readonly ReactionTally[]): {
    entering: string[];
    leaving: {
        at: number;
        chip: ReactionTally;
    }[];
};
export declare function ReactionSummary({ className, slotProps, reactions, onToggle, onAdd, available }: ReactionSummaryProps): import("react/jsx-runtime").JSX.Element;

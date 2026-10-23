import { type ReactNode } from 'react';
export interface PollOption {
    /** Stable id the host stores. */
    id: string;
    /** Text of the option. */
    label: string;
    /** Votes this option has, including the current person's. */
    votes: number;
}
/** Whole-number percentages that sum to exactly 100 (largest-remainder rounding; ties go to the earlier option). All zeros when there are no votes. */
export declare function pollPercentages(votes: readonly number[]): number[];
/** Sentence for the live region after a vote: "Vote counted. Option A leads with 54%." Ties and empty polls are named honestly. */
export declare function pollAnnouncement(options: readonly PollOption[]): string;
export interface PollProps {
    /** The question, shown above the options and used as the group name. */
    question: string;
    /** The options, in display order. */
    options: readonly PollOption[];
    /** Id of the option this person chose, or null/undefined if they have not voted. */
    voted?: string | null;
    /** Called with the option id when the person votes. Shown results do not call it again. */
    onVote(id: string): void;
    /** True once voting is over; results show even without a vote. */
    closed?: boolean;
    /** Extra line under the total, such as who can see the votes or when it closes. */
    footnote?: ReactNode;
}
export declare function Poll({ question, options, voted, onVote, closed, footnote }: PollProps): import("react/jsx-runtime").JSX.Element;

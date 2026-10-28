import type { PrimitivePartProps } from '../parts.js';
/** Sentence for who is typing: "" for nobody, "Ava is typing", "Ava and Ben are typing", "Ava, Ben and Cy are typing", "Ava and 3 others are typing". Blank names are ignored. */
export declare function typingLabel(names: readonly string[]): string;
/** Identity of the set of people typing, ignoring order and blanks. The spoken text changes only when this changes. */
export declare function typingSetKey(names: readonly string[]): string;
export interface TypingIndicatorProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        body?: PrimitivePartProps;
        dots?: PrimitivePartProps;
        dot?: PrimitivePartProps;
        text?: PrimitivePartProps;
    };
    /** Who is typing right now. An empty list hides the indicator (it leaves with a short fade). */
    names: string[];
    /** bubble: dots in a chat bubble, sentence read aloud only. inline: dots with the sentence shown beside them. Defaults to bubble. */
    variant?: 'bubble' | 'inline';
}
export declare function TypingIndicator({ className, slotProps, names, variant }: TypingIndicatorProps): import("react/jsx-runtime").JSX.Element;

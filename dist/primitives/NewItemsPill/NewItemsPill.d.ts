export type NewItemsPlacement = 'top' | 'bottom';
/** Default label: "1 new reply", "3 new replies". Bad counts read as zero. */
export declare function newItemsLabel(n: number): string;
/** Whole, non-negative count; anything else is 0. */
export declare function clampNewItems(n: number): number;
/** What to announce: the label only when the pill first appears (0 to n), nothing on increments, and empty once it is gone. */
export declare function newItemsAnnouncement(prev: number, next: number, label: (n: number) => string): string | null;
/** Splits a label into the number that rolls and the words after it. Labels that do not start with the exact number show whole, without a roll. */
export declare function splitNewItemsLabel(text: string, n: number): {
    rolls: boolean;
    rest: string;
};
export interface NewItemsPillProps {
    /** How many items are waiting. The pill shows while this is above zero. */
    count: number;
    /** Called when the pill is pressed; the host scrolls to or reveals the new items. */
    onShow: () => void;
    /** Full text for a count, read aloud and used as the accessible name. Defaults to "3 new replies". */
    label?: (n: number) => string;
    /** Which edge the pill drops in from. Defaults to top. */
    placement?: NewItemsPlacement;
}
export declare function NewItemsPill({ count, onShow, label, placement }: NewItemsPillProps): import("react/jsx-runtime").JSX.Element;

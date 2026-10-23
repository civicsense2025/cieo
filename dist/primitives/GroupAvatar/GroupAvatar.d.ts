export interface GroupAvatarPerson {
    /** Full name, used for the spoken label. */
    name: string;
    /** 1–3 characters shown when there is no photo. */
    initials: string;
    /** Approved photo URL only. Omit when none exists; never guess a photo. */
    src?: string;
}
/** Names as a short phrase: "Ava", "Ava and Ben", "Ava, Ben and Cy", "Ava, Ben and 3 others". Blank names are ignored. */
export declare function listNames(names: readonly string[]): string;
/** Spoken label for the whole group, e.g. "Ava, Ben and 3 others". */
export declare function groupAvatarLabel(names: readonly string[]): string;
/** Which faces to draw and how many people hide behind a "+n" tile. Up to four people show as faces; five or more show three faces plus the tile. */
export declare function groupAvatarLayout<T>(people: readonly T[]): {
    faces: T[];
    more: number;
};
export interface GroupAvatarProps {
    /** The people in the conversation, most relevant first. */
    people: GroupAvatarPerson[];
    /** Footprint of the circle. Defaults to md. */
    size?: 'sm' | 'md' | 'lg';
}
export declare function GroupAvatar({ people, size }: GroupAvatarProps): import("react/jsx-runtime").JSX.Element | null;

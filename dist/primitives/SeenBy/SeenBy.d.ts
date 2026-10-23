import { type GroupAvatarPerson } from '../GroupAvatar/GroupAvatar.js';
/** Spoken line for readers: "Seen by Ava", "Seen by Ava and Ben", "Seen by Ava, Ben and 2 others". Empty for nobody. */
export declare function seenByLabel(names: readonly string[]): string;
export interface SeenByProps {
    /** People who have read, oldest reader first. Nothing renders when empty. */
    people: GroupAvatarPerson[];
    /** Faces shown before the rest collapse into "+n". Defaults to 3. */
    max?: number;
}
export declare function SeenBy({ people, max }: SeenByProps): import("react/jsx-runtime").JSX.Element | null;

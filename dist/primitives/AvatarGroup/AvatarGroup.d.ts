import type { CSSProperties } from 'react';
export interface AvatarPerson {
    /** Full name, used by the row label (not rendered as text here). */
    name: string;
    /** 1–3 characters shown when there is no photo. Always required so exclusions render safely. */
    initials: string;
    /** Approved photo URL only. Omit when none exists; never guess a photo. */
    src?: string;
}
export interface AvatarGroupProps {
    people: AvatarPerson[];
    /** Max faces before collapsing into +N. Defaults to 4. */
    max?: number;
    size?: 'sm' | 'md';
    /** Optional text after the faces, e.g. "3k love" for review counts. Read by assistive tech; the faces stay decorative. */
    label?: string;
    style?: CSSProperties;
}
export declare function AvatarGroup({ people, max, size, label, style }: AvatarGroupProps): import("react/jsx-runtime").JSX.Element;

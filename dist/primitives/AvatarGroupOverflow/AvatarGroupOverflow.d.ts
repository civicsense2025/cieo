export interface AvatarGroupOverflowProps {
    /** Hidden face count shown as +N. Required. */
    count: number;
    /** Disc size, matches the stack faces. Defaults to md. */
    size?: 'sm' | 'md';
}
export declare function AvatarGroupOverflow({ count, size }: AvatarGroupOverflowProps): import("react/jsx-runtime").JSX.Element;

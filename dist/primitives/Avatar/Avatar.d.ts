export interface AvatarProps {
    /** Full name; becomes the accessible label. Required. */
    name: string;
    /** 1–3 characters shown when there is no photo. Required. */
    initials: string;
    /** Approved photo URL only. Omit when none exists; never guess a photo. */
    src?: string;
    /** Face size. Defaults to md. */
    size?: 'sm' | 'md';
}
export declare function Avatar({ name, initials, src, size }: AvatarProps): import("react/jsx-runtime").JSX.Element;

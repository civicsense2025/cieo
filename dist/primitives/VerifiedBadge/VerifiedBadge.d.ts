export type VerifiedBadgeSize = 'sm' | 'md';
/** Pixel-free size lookup: the CSS reads the data-size attribute, this keeps unknown input on the default. */
export declare function verifiedBadgeSize(size: unknown): VerifiedBadgeSize;
export interface VerifiedBadgeProps {
    /** Accessible name read by screen readers. Defaults to Verified. */
    label?: string;
    /** sm sits inline with caption text, md with body text. Defaults to md. */
    size?: VerifiedBadgeSize;
}
export declare function VerifiedBadge({ label, size }: VerifiedBadgeProps): import("react/jsx-runtime").JSX.Element;

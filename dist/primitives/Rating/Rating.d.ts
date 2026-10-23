/** Value a key moves to (1..max), or null when the key does nothing or the value would not change. No wrapping. */
export declare function ratingKeyStep(key: string, value: number, max: number): number | null;
/** Spoken summary: "4 out of 5". Value clamps to 0..max; halves keep one decimal. */
export declare function ratingLabel(value: number, max: number): string;
/** Start delays (ms) for stars from..to-1 popping in turn; the last starts by `window`, so the whole stagger fits in it. */
export declare function ratingPopDelays(from: number, to: number, window?: number): number[];
export interface RatingProps {
    /** Current rating, 0 for none. Fractions only display in read-only mode. */
    value: number;
    /** Called with the new rating when the viewer picks a star or uses the keyboard. */
    onChange?: (value: number) => void;
    /** Number of stars. Defaults to 5. */
    max?: number;
    /** What is being rated ("Rate this reply"). Required. */
    label: string;
    /** Shows the rating as an image ("4 out of 5") with no interaction. */
    readOnly?: boolean;
    /** Star size. Defaults to md. */
    size?: 'sm' | 'md';
}
export declare function Rating({ value, onChange, max, label, readOnly, size }: RatingProps): import("react/jsx-runtime").JSX.Element;

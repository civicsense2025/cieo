export interface SpinnerProps {
    label?: string;
    size?: 'sm' | 'md'; /** False stops rotation via data-motion="off". Defaults to true. */
    motion?: boolean;
}
export declare function Spinner({ label, size, motion }: SpinnerProps): import("react/jsx-runtime").JSX.Element;

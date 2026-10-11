export type StatusDotStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface StatusDotProps {
    /** State shown by the dot. Defaults to default. */
    status?: StatusDotStatus;
    /** Accessible name. Omit only beside visible status text. */
    label?: string;
}
export declare function StatusDot({ status, label }: StatusDotProps): import("react/jsx-runtime").JSX.Element;

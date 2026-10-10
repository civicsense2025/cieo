import type { ReactNode } from 'react';
export type AvatarStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface AvatarStatusDotProps {
    /** Presence state shown by the dot. Defaults to default. */
    status?: AvatarStatus;
    /** The single face this decorates (Avatar or approved image). */
    children: ReactNode;
}
export declare function AvatarStatusDot({ status, children }: AvatarStatusDotProps): import("react/jsx-runtime").JSX.Element;

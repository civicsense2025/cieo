import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export type AvatarStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface AvatarStatusDotProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        dot?: PrimitivePartProps;
    };
    /** Presence state shown by the dot. Defaults to default. */
    status?: AvatarStatus;
    /** The single face this decorates (Avatar or approved image). */
    children: ReactNode;
}
export declare function AvatarStatusDot({ className, slotProps, status, children }: AvatarStatusDotProps): import("react/jsx-runtime").JSX.Element;

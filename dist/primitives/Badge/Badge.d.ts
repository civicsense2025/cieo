import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export type BadgeStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface BadgeProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    status?: BadgeStatus;
    children: ReactNode;
}
export declare function Badge({ className, slotProps, status, children }: BadgeProps): import("react/jsx-runtime").JSX.Element;

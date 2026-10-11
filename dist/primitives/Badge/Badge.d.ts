import type { ReactNode } from 'react';
export type BadgeStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface BadgeProps {
    status?: BadgeStatus;
    children: ReactNode;
}
export declare function Badge({ status, children }: BadgeProps): import("react/jsx-runtime").JSX.Element;

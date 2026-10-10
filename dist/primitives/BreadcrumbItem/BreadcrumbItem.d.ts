import type { ReactNode } from 'react';
export interface BreadcrumbItemProps {
    current?: boolean;
    children: ReactNode;
}
export declare function BreadcrumbItem({ current, children }: BreadcrumbItemProps): import("react/jsx-runtime").JSX.Element;

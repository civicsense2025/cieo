import type { ReactNode } from 'react';
export interface TopNavMegaMenuFeaturedCardProps {
    /** Card title. Required. */
    title: string;
    /** Supporting text. */
    description?: string;
    /** Link target; renders an article when absent. */
    href?: string;
    children?: ReactNode;
}
export declare function TopNavMegaMenuFeaturedCard({ title, description, href, children }: TopNavMegaMenuFeaturedCardProps): import("react/jsx-runtime").JSX.Element;

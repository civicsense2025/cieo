import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TopNavMegaMenuFeaturedCardProps {
    className?: string;
    slotProps?: {
        title?: PrimitivePartProps;
        description?: PrimitivePartProps;
        root?: PrimitivePartProps;
    };
    /** Card title. Required. */
    title: string;
    /** Supporting text. */
    description?: string;
    /** Link target; renders an article when absent. */
    href?: string;
    children?: ReactNode;
}
export declare function TopNavMegaMenuFeaturedCard({ className, slotProps, title, description, href, children }: TopNavMegaMenuFeaturedCardProps): import("react/jsx-runtime").JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
export interface TopNavMegaMenuItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
        description?: PrimitivePartProps;
    };
    /** Link target. Required. */
    href: string;
    /** Row title. Required. */
    title: string;
    /** One-line supporting text. */
    description?: string;
}
export declare function TopNavMegaMenuItem({ className, slotProps, href, title, description }: TopNavMegaMenuItemProps): import("react/jsx-runtime").JSX.Element;

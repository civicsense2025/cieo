export interface TopNavMegaMenuItemProps {
    /** Link target. Required. */
    href: string;
    /** Row title. Required. */
    title: string;
    /** One-line supporting text. */
    description?: string;
}
export declare function TopNavMegaMenuItem({ href, title, description }: TopNavMegaMenuItemProps): import("react/jsx-runtime").JSX.Element;

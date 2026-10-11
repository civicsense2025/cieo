export interface SideNavCollapseButtonProps {
    /** Whether the rail is expanded. Required. */
    expanded: boolean;
    /** Toggle handler. */
    onToggle?: () => void;
    /** Accessible label. Defaults to Collapse navigation. */
    label?: string;
}
export declare function SideNavCollapseButton({ expanded, onToggle, label }: SideNavCollapseButtonProps): import("react/jsx-runtime").JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
export interface SideNavCollapseButtonProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Whether the rail is expanded. Required. */
    expanded: boolean;
    /** Toggle handler. */
    onToggle?: () => void;
    /** Accessible label. Defaults to Collapse navigation. */
    label?: string;
}
export declare function SideNavCollapseButton({ className, slotProps, expanded, onToggle, label }: SideNavCollapseButtonProps): import("react/jsx-runtime").JSX.Element;

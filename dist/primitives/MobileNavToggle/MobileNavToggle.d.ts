import type { PrimitivePartProps } from '../parts.js';
export interface MobileNavToggleProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Whether the drawer is open. Required. */
    expanded: boolean;
    /** Toggle handler. */
    onToggle?: () => void;
    /** Accessible label. Defaults to Open navigation. */
    label?: string;
}
export declare function MobileNavToggle({ className, slotProps, expanded, onToggle, label }: MobileNavToggleProps): import("react/jsx-runtime").JSX.Element;

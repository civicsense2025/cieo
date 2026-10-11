export interface MobileNavToggleProps {
    /** Whether the drawer is open. Required. */
    expanded: boolean;
    /** Toggle handler. */
    onToggle?: () => void;
    /** Accessible label. Defaults to Open navigation. */
    label?: string;
}
export declare function MobileNavToggle({ expanded, onToggle, label }: MobileNavToggleProps): import("react/jsx-runtime").JSX.Element;

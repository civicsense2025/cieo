export interface DropdownMenuRadioItemProps {
    /** Accessible name for the option (e.g. "Newest first"). Required. */
    label: string;
    /** Option key matched against the group value. Required. */
    value: string;
}
export declare function DropdownMenuRadioItem({ label, value }: DropdownMenuRadioItemProps): import("react/jsx-runtime").JSX.Element;

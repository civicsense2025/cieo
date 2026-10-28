import type { PrimitivePartProps } from '../parts.js';
export interface DropdownMenuRadioItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the option (e.g. "Newest first"). Required. */
    label: string;
    /** Option key matched against the group value. Required. */
    value: string;
}
export declare function DropdownMenuRadioItem({ className, slotProps, label, value }: DropdownMenuRadioItemProps): import("react/jsx-runtime").JSX.Element;

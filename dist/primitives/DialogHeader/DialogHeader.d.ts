import type { PrimitivePartProps } from '../parts.js';
export interface DialogHeaderProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Visible dialog title. Required. */
    title: string;
    /** Called when the close button is pressed. Omit to render no button. */
    onClose?: () => void;
    /** Close button label. Defaults to Close. */
    closeLabel?: string;
}
export declare function DialogHeader({ className, slotProps, title, onClose, closeLabel }: DialogHeaderProps): import("react/jsx-runtime").JSX.Element;

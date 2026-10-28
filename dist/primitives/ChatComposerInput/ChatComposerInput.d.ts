import type { PrimitivePartProps } from '../parts.js';
export interface ChatComposerInputProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the input (e.g. "Message support"). Required. */
    label: string;
    /** Current text. Host-controlled. Optional. */
    value?: string;
    /** Called on each edit. Host updates value. Optional. */
    onChange?: (value: string) => void;
    /** Visible row count. Defaults to 1. */
    rows?: number;
    /** Placeholder hint. Optional. */
    placeholder?: string;
}
export declare function ChatComposerInput({ className, slotProps, label, value, onChange, rows, placeholder }: ChatComposerInputProps): import("react/jsx-runtime").JSX.Element;

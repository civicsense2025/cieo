import type { PrimitivePartProps } from '../parts.js';
export interface TokenizerProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        chips?: PrimitivePartProps;
        chip?: PrimitivePartProps;
        input?: PrimitivePartProps;
    };
    /** Visible label naming the set. Required. */
    label: string;
    /** Current tokens, owned by the host. Required. */
    values: string[];
    /** Host remove hook by index. Optional. */
    onRemove?: (index: number) => void;
    /** Host add hook with trimmed input text. Optional. */
    onAdd?: (text: string) => void;
}
export declare function Tokenizer({ className, slotProps, label, values, onRemove, onAdd }: TokenizerProps): import("react/jsx-runtime").JSX.Element;

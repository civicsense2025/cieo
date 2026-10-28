import type { PrimitivePartProps } from '../parts.js';
import type { MessageView } from '../../agent/reduce.js';
export interface StreamingMessageProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** The message as the store folded it. */
    message: MessageView;
    /** Author name, e.g. "Researcher". Optional. */
    author?: string;
    /** Display time, e.g. "9:41 AM". Optional. */
    time?: string;
    /** Note shown when the text was capped. Defaults to "Truncated". */
    truncatedText?: string;
}
export declare function StreamingMessage({ className, slotProps, message, author, time, truncatedText }: StreamingMessageProps): import("react/jsx-runtime").JSX.Element;

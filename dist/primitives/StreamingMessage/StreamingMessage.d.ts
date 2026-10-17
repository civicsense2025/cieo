import type { MessageView } from '../../agent/reduce.js';
export interface StreamingMessageProps {
    /** The message as the store folded it. */
    message: MessageView;
    /** Author name, e.g. "Researcher". Optional. */
    author?: string;
    /** Display time, e.g. "9:41 AM". Optional. */
    time?: string;
    /** Note shown when the text was capped. Defaults to "Truncated". */
    truncatedText?: string;
}
export declare function StreamingMessage({ message, author, time, truncatedText }: StreamingMessageProps): import("react/jsx-runtime").JSX.Element;

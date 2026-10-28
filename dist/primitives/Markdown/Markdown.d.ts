import type { PrimitivePartProps } from '../parts.js';
export interface MarkdownProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Sanitized HTML string. Must already be safe; rendered verbatim. */
    html: string;
}
export declare function Markdown({ className, slotProps, html }: MarkdownProps): import("react/jsx-runtime").JSX.Element;

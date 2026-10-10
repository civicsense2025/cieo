export interface MarkdownProps {
    /** Sanitized HTML string. Must already be safe; rendered verbatim. */
    html: string;
}
export declare function Markdown({ html }: MarkdownProps): import("react/jsx-runtime").JSX.Element;

export type RichTextTokenType = 'text' | 'url' | 'mention' | 'tag' | 'break';
export interface RichTextToken {
    type: RichTextTokenType;
    /** The text as written (a URL keeps its original spelling). */
    value: string;
    /** Full address for url tokens, always http or https. */
    href?: string;
}
/** Splits a matched address from the punctuation that ends the sentence around it. */
export declare function trimUrl(raw: string): {
    url: string;
    rest: string;
};
/** Splits post text into text, url, mention, tag and break tokens. Pure; the same input always gives the same tokens, and joining every value rebuilds the text (breaks as newlines). */
export declare function tokenizeRichText(text: string): RichTextToken[];
/** Display form of an address: no scheme, no www., end ellipsized so the result is at most `max` characters. */
export declare function shortenUrl(url: string, max?: number): string;
export interface RichTextProps {
    /** Plain post text. Rendered as text nodes, never as HTML. */
    text: string;
    /** Address builders for @mentions and #tags. Without them mentions are plain text and tags are not links. */
    hrefFor?: {
        mention?: (handle: string) => string;
        tag?: (tag: string) => string;
    };
    /** Longest visible link text before it is ellipsized. Defaults to 28. */
    maxUrlLength?: number;
}
export declare function RichText({ text, hrefFor, maxUrlLength }: RichTextProps): import("react/jsx-runtime").JSX.Element;

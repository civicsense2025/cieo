/** Handle without a leading @ and surrounding space. Empty when the input is blank or contains whitespace. */
export declare function normalizeHandle(raw: string): string;
/** The address when it is safe to put in an href, else null. User content is untrusted, so only http and https URLs with a host pass, plus same-site relative links (/path, ./path, ../path, #hash or ?query) unless `relative` is false. Protocol-relative (//host) and backslash tricks are refused because browsers resolve them to another site. */
export declare function safeHref(href: unknown, opts?: {
    relative?: boolean;
}): string | null;
export interface MentionProps {
    /** Account handle, with or without the leading @. */
    handle: string;
    /** Profile address. Only http, https and same-site paths become a link; anything else renders as text. */
    href?: string;
    /** Display name, shown as the tooltip. */
    name?: string;
}
export declare function Mention({ handle, href, name }: MentionProps): import("react/jsx-runtime").JSX.Element | null;

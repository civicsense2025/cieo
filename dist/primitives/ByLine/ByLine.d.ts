import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ByLineProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        badge?: PrimitivePartProps;
        handle?: PrimitivePartProps;
        separator?: PrimitivePartProps;
        time?: PrimitivePartProps;
    };
    /** Display name of the author. Truncates before the time does. Required. */
    author: string;
    /** Profile link. Only http(s) and relative links become anchors; anything else renders as plain text. */
    href?: string;
    /** Slot after the name, such as a verified badge. */
    badge?: ReactNode;
    /** Slot for where the post lives (a topic, a thread title), shown after a "›" separator. */
    context?: ReactNode;
    /** Link for the context crumb, with the same safe-link rule as `href`. */
    contextHref?: string;
    /** Display text for the age, such as "1d". Muted, never truncated. */
    time?: string;
    /** Machine-readable date (ISO 8601) written to the time element. */
    dateTime?: string;
    /** Account handle without the at sign; shown muted after the name when there is room. */
    handle?: string;
    /** Id placed on the root so a parent can label itself by this line. */
    id?: string;
}
export declare function ByLine({ className, slotProps, author, href, badge, context, contextHref, time, dateTime, handle, id }: ByLineProps): import("react/jsx-runtime").JSX.Element;

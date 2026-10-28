import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export type ActivityTone = 'neutral' | 'accent' | 'danger' | 'success';
/** Which element carries the row's main action: a link, a button, or nothing when the row is informational. */
export declare function activityMainTag(href: string | undefined, onSelect: (() => void) | undefined): 'a' | 'button' | 'div';
export interface ActivityItemProps {
    className?: string;
    slotProps?: {
        line?: PrimitivePartProps;
        actor?: PrimitivePartProps;
        what?: PrimitivePartProps;
        preview?: PrimitivePartProps;
        root?: PrimitivePartProps;
        lead?: PrimitivePartProps;
        avatar?: PrimitivePartProps;
        badge?: PrimitivePartProps;
        main?: PrimitivePartProps;
        dot?: PrimitivePartProps;
        actions?: PrimitivePartProps;
    };
    /** Who did it: name in bold plus an avatar node (e.g. an Avatar). */
    actor: {
        name: string;
        avatar: ReactNode;
    };
    /** Small badge on the avatar corner naming the kind of event (heart, reply arrow). Decorative. */
    icon?: ReactNode;
    /** Colors the icon badge. Defaults to neutral. */
    tone?: ActivityTone;
    /** What happened, after the actor name: "liked your reply". */
    children: ReactNode;
    /** Quoted snippet of the thing acted on. */
    preview?: string;
    /** Human time text such as "2h". */
    time?: string;
    /** Machine time for the <time> element (ISO 8601). */
    dateTime?: string;
    /** Unread rows get a dot and stronger text; flipping to false fades the dot out. */
    unread?: boolean;
    /** Makes the whole row a link. */
    href?: string;
    /** Makes the whole row a button when there is no href. */
    onSelect?: () => void;
    /** Controls such as Follow back. They stay separately focusable above the stretched row action. */
    actions?: ReactNode;
}
export declare function ActivityItem({ className, slotProps, actor, icon, tone, children, preview, time, dateTime, unread, href, onSelect, actions }: ActivityItemProps): import("react/jsx-runtime").JSX.Element;

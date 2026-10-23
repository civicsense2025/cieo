import { type ReactNode } from 'react';
/** Plain text of a React node: strings and numbers are kept, elements contribute their children, everything else is dropped. Used to read a preview aloud. */
export declare function nodeText(node: ReactNode): string;
/** Whole unread count shown on the badge: negative, fractional and non-finite input clamps to a whole count of at least 0; above 99 it reads "99+". */
export declare function unreadBadgeText(unread: number): string;
export interface ConversationSummary {
    title: string;
    unread?: number;
    muted?: boolean;
    pinned?: boolean;
    draft?: boolean;
    typing?: readonly string[];
    /** Plain text of the preview. */
    preview?: string;
    time?: string;
}
/** Spoken name of a row: "Design team, 3 unread, Ava: see you at 3, 9:41 AM". Typing replaces the preview; a draft says so. */
export declare function conversationLabel(s: ConversationSummary): string;
export interface ConversationListItemProps {
    /** Stable id of the conversation. Required; the list orders and focuses rows by it. */
    id: string;
    /** Conversation name. Required. */
    title: string;
    /** Face of the conversation: an Avatar or a GroupAvatar. Decorative; the title names the row. */
    avatar: ReactNode;
    /** Last message, as text or a short run of inline nodes. Cut to one line. */
    preview?: ReactNode;
    /** Short time text for the last message (for example "9:41 AM"). */
    time?: string;
    /** Machine-readable time for the time element (ISO 8601). */
    dateTime?: string;
    /** Unread messages. Zero or missing hides the badge. */
    unread?: number;
    /** Notifications are off: shows a muted-bell icon and a neutral badge. */
    muted?: boolean;
    /** Pinned to the top: shows a pin when there is no unread badge. */
    pinned?: boolean;
    /** The preview is an unsent draft: prefixes "Draft:" in the danger color. */
    draft?: boolean;
    /** People typing right now. When not empty, an inline typing indicator replaces the preview. */
    typing?: string[];
    /** This is the open conversation. Falls back to the list's selectedId. */
    selected?: boolean;
    /** Makes the row a link to the conversation. Without it the row is a button. */
    href?: string;
    /** Called with the id when the row is activated. */
    onSelect?: (id: string) => void;
}
export declare function ConversationListItem({ id, title, avatar, preview, time, dateTime, unread, muted, pinned, draft, typing, selected, href, onSelect }: ConversationListItemProps): import("react/jsx-runtime").JSX.Element;

/** Text for the divider: the host's label when given, else "3 new messages" / "1 new message" for a count, else "New messages". */
export declare function unreadDividerLabel(count?: number, label?: string): string;
export interface UnreadDividerProps {
    /** How many messages are unread. Becomes part of the label when no label is given. */
    count?: number;
    /** Replaces the wording entirely (for other languages or other things than messages). Defaults to "New messages", or "3 new messages" with a count. */
    label?: string;
}
export declare function UnreadDivider({ count, label }: UnreadDividerProps): import("react/jsx-runtime").JSX.Element;

import { type ReactNode } from 'react';
/** Ids of the rows in `children`, in the order the host wrote them. Anything without a string id is ignored. */
export declare function conversationIds(children: ReactNode): string[];
/** Display order: ids in `order` first (unknown ids dropped, repeats ignored), then any remaining ids in their written order. Without `order`, the written order. */
export declare function conversationOrder(ids: readonly string[], order?: readonly string[]): string[];
/** Which row should be the single tab stop: the one last focused, else the selected one, else the first. Null for an empty list. */
export declare function conversationTabbable(ids: readonly string[], activeId: string | null, selectedId?: string): string | null;
/** Row index a key moves focus to, or null for keys that do nothing. ArrowUp/ArrowDown step, Home/End jump, and it stops at both ends. */
export declare function conversationRove(key: string, current: number, count: number): number | null;
export interface ConversationListContextValue {
    /** Id of the row that is the list's tab stop. */
    tabbableId: string | null;
    /** Id of the open conversation, if the host gave one. */
    selectedId?: string;
}
export declare const ConversationListContext: import("react").Context<ConversationListContextValue | null>;
export interface ConversationListProps {
    /** Accessible name for the list (for example "Conversations"). Required. */
    label: string;
    /** ConversationListItem elements, in any order; their ids and `order` decide where they appear. */
    children: ReactNode;
    /** Conversation ids in display order. When it changes the rows glide to their new places, so a chat with a new message can jump to the top. Rows missing from it follow in written order. */
    order?: string[];
    /** Id of the open conversation. Marks that row as current and makes it the first tab stop. */
    selectedId?: string;
}
export declare function ConversationList({ label, children, order, selectedId }: ConversationListProps): import("react/jsx-runtime").JSX.Element;

import { type ReactNode } from 'react';
export type CommentState = 'default' | 'pending' | 'failed' | 'deleted' | 'highlighted';
export interface CommentProps {
    /** Display name of the author. Labels the article. Required. */
    author: string;
    /** Avatar element (an Avatar, an image). Sized by the comment: smaller from depth 1. Required. */
    avatar: ReactNode;
    /** Profile link for the author, http(s) or relative only. */
    authorHref?: string;
    /** Slot after the name, such as a verified badge. */
    badge?: ReactNode;
    /** Where the comment lives, shown after a "›" in the byline. */
    context?: ReactNode;
    /** Relative time text such as "1d". */
    time?: string;
    /** ISO date for the time element. */
    dateTime?: string;
    /** Slot at the far end of the header: a "more" menu button. */
    menu?: ReactNode;
    /** The comment body. */
    children?: ReactNode;
    /** Slot under the body: link card, image, an audio player. */
    attachments?: ReactNode;
    /** Slot for the action row: like, reply, repost, share, or anything else. */
    actions?: ReactNode;
    /** Slot for nested replies, rendered in the content column under the actions. */
    replies?: ReactNode;
    /** Visual and semantic state. Defaults to default. */
    state?: CommentState;
    /** Slot for a status line, such as a retry button when the state is failed. */
    status?: ReactNode;
    /** Nesting level, 0 for top level. From 1 the avatar is smaller and a curve joins the parent's rail. */
    depth?: number;
    /** Draws the rail below the avatar even without replies (use when a following comment continues the thread). */
    railed?: boolean;
    /** Element id, for permalinks. */
    id?: string;
    /** Plays the short rise-in for a comment that just arrived. */
    entering?: boolean;
}
/** Depth as a whole number of at least 0; anything else is 0. */
export declare function commentDepth(depth: number | undefined): number;
/** True when the rail should run below the avatar. */
export declare function commentHasRail(railed: boolean | undefined, hasReplies: boolean): boolean;
export declare function Comment({ author, avatar, authorHref, badge, context, time, dateTime, menu, children, attachments, actions, replies, state, status, depth, railed, id, entering }: CommentProps): import("react/jsx-runtime").JSX.Element;

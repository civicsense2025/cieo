import { type ReactNode } from 'react';
export type CommentNode<T = unknown> = T & {
    id: string;
    children?: CommentNode<T>[];
};
export interface FlatComment {
    id: string;
    parentId?: string | null;
}
/** Turns a flat list into a tree. Keeps input order, orphans (unknown parent) become roots, and cycles are broken so it always terminates. Duplicate ids keep the first. */
export declare function buildCommentTree<T extends FlatComment>(flat: readonly T[]): CommentNode<T>[];
/** Number of nodes below `node`, at any depth. Safe on malformed data: a node is counted once. */
export declare function countDescendants(node: {
    id?: string;
    children?: readonly unknown[];
} | null | undefined): number;
/** Replies to show now, and how many stay hidden. Expanded shows everything; otherwise only the first `initial` (a whole number of at least 0). */
export declare function visibleReplies<N>(children: readonly N[] | undefined, expanded: boolean, initial: number): {
    visible: N[];
    hidden: number;
};
/** Depth-first list of every node below `children`, each stripped of its own children. Used past the depth cap. */
export declare function flattenReplies<N extends {
    children?: N[];
}>(children: readonly N[] | undefined): N[];
/** Default label for the reveal button. */
export declare function moreRepliesLabel(count: number): string;
export interface CommentRenderContext {
    /** 0 for top level. Pass to Comment so it can draw the rail curve and the smaller avatar. */
    depth: number;
    /** Nested replies and their "view more" button. Pass as Comment's `replies` slot. Null when there are none. */
    replies: ReactNode;
    hasReplies: boolean;
    /** Direct replies still hidden behind "view more". */
    hiddenCount: number;
}
export interface CommentThreadProps<T = unknown> {
    /** Accessible name for the whole thread (e.g. "Comments"). Required. */
    label: string;
    /** Top-level comments, each with optional children. Required. */
    items: CommentNode<T>[];
    /** Renders one comment. Return a Comment and give it `ctx.replies`, `ctx.depth` and `ctx.hasReplies`. Required. */
    renderItem: (node: CommentNode<T>, ctx: CommentRenderContext) => ReactNode;
    /** Deepest nesting level. Replies below it show at this level, flattened in order. Defaults to 3. */
    maxDepth?: number;
    /** Replies shown per branch before "view more". Defaults to 2. */
    initialReplies?: number;
    /** Text for the reveal button. Defaults to "View N more replies". */
    moreLabel?: (hidden: number) => string;
    /** Ids of comments that just arrived; they rise in. */
    newIds?: string[];
    /** Accessible name for a reply list, given its parent (e.g. "Replies to Ava"). */
    branchLabel?: (parent: CommentNode<T>) => string;
    /** Ids of branches opened past `initialReplies`. Pass with onExpandedChange to control; omit for internal state. */
    expanded?: string[];
    /** Called with the next list of opened branch ids. */
    onExpandedChange?: (expanded: string[]) => void;
}
export declare function CommentThread<T = unknown>({ label, items, renderItem, maxDepth, initialReplies, moreLabel, newIds, branchLabel, expanded, onExpandedChange }: CommentThreadProps<T>): import("react/jsx-runtime").JSX.Element;

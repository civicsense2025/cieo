// src/primitives/Comment/Comment.tsx
'use client';
/* Comment. One post in a thread: avatar, byline, body, and slots for attachments, actions and nested replies. Host owns all content; this owns layout, the rail and the state looks. */
import { useId, type ReactNode } from 'react';
import { ByLine } from '../ByLine/ByLine.js';

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
export function commentDepth(depth: number | undefined): number {
  return typeof depth === 'number' && Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : 0;
}

/** True when the rail should run below the avatar. */
export function commentHasRail(railed: boolean | undefined, hasReplies: boolean): boolean {
  return Boolean(railed) || hasReplies;
}

export function Comment({ author, avatar, authorHref, badge, context, time, dateTime, menu, children, attachments, actions, replies, state = 'default', status, depth, railed, id, entering }: CommentProps) {
  const lineId = useId();
  const level = commentDepth(depth);
  const hasReplies = replies !== undefined && replies !== null && replies !== false;
  const deleted = state === 'deleted';
  const rail = commentHasRail(railed, hasReplies);
  return (
    <article
      id={id}
      aria-labelledby={lineId}
      aria-busy={state === 'pending' ? true : undefined}
      className="cieo cieo-comment"
      data-state={state}
      data-depth={level}
      data-railed={rail ? '' : undefined}
      data-entering={entering ? '' : undefined}
    >
      {level > 0 ? <span className="cieo-comment-elbow" aria-hidden="true" /> : null}
      <div className="cieo-comment-rail">
        <div className="cieo-comment-avatar" data-empty={deleted ? '' : undefined}>
          {deleted ? null : avatar}
        </div>
        {rail ? <span className="cieo-comment-line" aria-hidden="true" /> : null}
      </div>
      <div className="cieo-comment-main">
        {deleted ? (
          <p id={lineId} className="cieo-comment-deleted">
            This comment was deleted
          </p>
        ) : (
          <>
            <div className="cieo-comment-head">
              <ByLine id={lineId} author={author} href={authorHref} badge={badge} context={context} time={time} dateTime={dateTime} />
              {menu ? <div className="cieo-comment-menu">{menu}</div> : null}
            </div>
            {children ? <div className="cieo-comment-body">{children}</div> : null}
            {attachments ? <div className="cieo-comment-attachments">{attachments}</div> : null}
            {actions ? <div className="cieo-comment-actions">{actions}</div> : null}
            {state === 'pending' ? (
              <p className="cieo-comment-status" data-tone="muted" role="status">
                Posting…
              </p>
            ) : null}
            {state === 'failed' ? (
              <div className="cieo-comment-status" data-tone="danger" role="alert">
                {status ?? 'Could not post this comment.'}
              </div>
            ) : null}
          </>
        )}
      </div>
      {hasReplies ? <div className="cieo-comment-replies">{replies}</div> : null}
    </article>
  );
}

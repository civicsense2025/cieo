// src/primitives/ConversationListItem/ConversationListItem.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ConversationListItem. One row of the inbox: avatar, title and time, preview and unread badge. The host owns the content and what a click does; the row owns the layout, the badge motion and the spoken summary. */
import { Children, isValidElement, useContext, type ReactNode } from 'react';
import { Digits, S, usePresence } from '../../react/index.js';
import { ConversationListContext } from '../ConversationList/ConversationList.js';
import { TypingIndicator, typingLabel } from '../TypingIndicator/TypingIndicator.js';

/** Plain text of a React node: strings and numbers are kept, elements contribute their children, everything else is dropped. Used to read a preview aloud. */
export function nodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode; 'aria-hidden'?: unknown };
    if (props['aria-hidden'] === true || props['aria-hidden'] === 'true') return '';
    return Children.toArray(props.children).map(nodeText).join('');
  }
  return '';
}

/** Whole unread count shown on the badge: negative, fractional and non-finite input clamps to a whole count of at least 0; above 99 it reads "99+". */
export function unreadBadgeText(unread: number): string {
  const n = Number.isFinite(unread) ? Math.max(0, Math.floor(unread)) : 0;
  return n > 99 ? '99+' : String(n);
}

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
export function conversationLabel(s: ConversationSummary): string {
  const unread = Number.isFinite(s.unread) ? Math.max(0, Math.floor(s.unread ?? 0)) : 0;
  const typing = s.typing && s.typing.length > 0 ? typingLabel(s.typing) : '';
  const preview = s.preview?.trim() ?? '';
  const body = typing || (s.draft ? `Draft: ${preview}`.trim() : preview);
  return [s.title, unread > 0 ? `${unread} unread` : '', s.muted ? 'muted' : '', s.pinned ? 'pinned' : '', body, s.time ?? ''].filter(Boolean).join(', ');
}

export interface ConversationListItemProps {
  className?: string;
  slotProps?: { avatar?: PrimitivePartProps; main?: PrimitivePartProps; top?: PrimitivePartProps; title?: PrimitivePartProps; time?: PrimitivePartProps; bottom?: PrimitivePartProps; line?: PrimitivePartProps; preview?: PrimitivePartProps; draft?: PrimitivePartProps; typing?: PrimitivePartProps; flags?: PrimitivePartProps; icon?: PrimitivePartProps; badge?: PrimitivePartProps; root?: PrimitivePartProps };

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

const bell = (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 6.5a3.5 3.5 0 0 1 6.2-2.2M11.5 7.5c0 2.5 1 3.5 1.5 4H3.5c.5-.5 1-1.5 1-4" />
    <path d="M6.7 13a1.4 1.4 0 0 0 2.6 0M2 2l12 12" />
  </svg>
);
const pin = (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2l4.5 4.5-2 .5-2.5 2.5.5 3-1 1-2.5-2.5L3 13.5M6.5 5.5L5 6l-1 1 5 5" />
  </svg>
);

export function ConversationListItem({ className, slotProps, id, title, avatar, preview, time, dateTime, unread = 0, muted, pinned, draft, typing = [], selected, href, onSelect }: ConversationListItemProps) {
  const list = useContext(ConversationListContext);
  const count = Number.isFinite(unread) ? Math.max(0, Math.floor(unread)) : 0;
  const isSelected = selected ?? (list?.selectedId !== undefined && list.selectedId === id);
  const isTyping = typing.some((n) => n.trim() !== '');
  const badge = usePresence<HTMLSpanElement>(count > 0, { from: { y: 0, scale: 0.6 }, cfg: S.snap });
  const name = conversationLabel({ title, unread: count, muted, pinned, draft, typing, preview: nodeText(preview), time });
  const tabIndex = list ? (list.tabbableId === id ? 0 : -1) : 0;
  const common = {
    'data-conversation-row': '',
    'data-conversation-id': id,
    'aria-current': isSelected ? ('true' as const) : undefined,
    'aria-label': name,
    tabIndex,
    className: 'cieo-conversation-list-item-row',
    onClick: onSelect ? () => onSelect(id) : undefined,
  };
  const body = (
    <>
      <span aria-hidden="true" className="cieo-conversation-list-item-avatar" {...customizePart(slotProps?.avatar, "cieo-conversation-list-item-avatar")}>
        {avatar}
      </span>
      <span className="cieo-conversation-list-item-main" {...customizePart(slotProps?.main, "cieo-conversation-list-item-main")}>
        <span className="cieo-conversation-list-item-top" {...customizePart(slotProps?.top, "cieo-conversation-list-item-top")}>
          <span className="cieo-conversation-list-item-title" {...customizePart(slotProps?.title, "cieo-conversation-list-item-title")}>{title}</span>
          {time ? (
            <time dateTime={dateTime} className="cieo-conversation-list-item-time" {...customizePart(slotProps?.time, "cieo-conversation-list-item-time")}>
              {time}
            </time>
          ) : null}
        </span>
        <span className="cieo-conversation-list-item-bottom" {...customizePart(slotProps?.bottom, "cieo-conversation-list-item-bottom")}>
          <span className="cieo-conversation-list-item-line" {...customizePart(slotProps?.line, "cieo-conversation-list-item-line")}>
            <span className="cieo-conversation-list-item-preview" data-hidden={isTyping ? '' : undefined} {...customizePart(slotProps?.preview, "cieo-conversation-list-item-preview")}>
              {draft ? <span className="cieo-conversation-list-item-draft" {...customizePart(slotProps?.draft, "cieo-conversation-list-item-draft")}>Draft: </span> : null}
              {preview}
            </span>
            <span className="cieo-conversation-list-item-typing" data-shown={isTyping ? '' : undefined} {...customizePart(slotProps?.typing, "cieo-conversation-list-item-typing")}>
              <TypingIndicator names={typing} variant="inline" />
            </span>
          </span>
          <span className="cieo-conversation-list-item-flags" {...customizePart(slotProps?.flags, "cieo-conversation-list-item-flags")}>
            {muted ? <span className="cieo-conversation-list-item-icon" {...customizePart(slotProps?.icon, "cieo-conversation-list-item-icon")}>{bell}</span> : null}
            {pinned && count === 0 ? <span className="cieo-conversation-list-item-icon" {...customizePart(slotProps?.icon, "cieo-conversation-list-item-icon")}>{pin}</span> : null}
            {badge.mounted ? (
              <span ref={badge.ref} className="cieo-conversation-list-item-badge" {...customizePart(slotProps?.badge, "cieo-conversation-list-item-badge")}>
                <Digits value={unreadBadgeText(count)} />
              </span>
            ) : null}
          </span>
        </span>
      </span>
    </>
  );
  return (
    <div
      role="listitem"
      data-selected={isSelected ? '' : undefined}
      data-unread={count > 0 ? '' : undefined}
      data-muted={muted ? '' : undefined}
      data-pinned={pinned ? '' : undefined}
      className="cieo cieo-conversation-list-item" {...customizePart(slotProps?.root, "cieo cieo-conversation-list-item", undefined, className)}
    >
      {href ? (
        <a href={href} {...common}>
          {body}
        </a>
      ) : (
        <button type="button" {...common}>
          {body}
        </button>
      )}
    </div>
  );
}

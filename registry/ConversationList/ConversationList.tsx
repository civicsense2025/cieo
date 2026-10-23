// src/primitives/ConversationList/ConversationList.tsx
'use client';
/* ConversationList. The inbox: a list of ConversationListItem rows with one tab stop, arrow-key movement, and rows that glide to their new places when the order changes. The host owns the conversations and their order. */
import { Children, cloneElement, createContext, isValidElement, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import { roveFocus, roveIndex, useFlip } from '../../react/index.js';

type RowElement = ReactElement<{ id: string }>;

/** Ids of the rows in `children`, in the order the host wrote them. Anything without a string id is ignored. */
export function conversationIds(children: ReactNode): string[] {
  return Children.toArray(children)
    .filter((c): c is RowElement => isValidElement(c) && typeof (c.props as { id?: unknown }).id === 'string')
    .map((c) => c.props.id);
}

/** Display order: ids in `order` first (unknown ids dropped, repeats ignored), then any remaining ids in their written order. Without `order`, the written order. */
export function conversationOrder(ids: readonly string[], order?: readonly string[]): string[] {
  const known = new Set(ids);
  const first = [...new Set(order ?? [])].filter((id) => known.has(id));
  const placed = new Set(first);
  return [...first, ...ids.filter((id) => !placed.has(id))];
}

/** Which row should be the single tab stop: the one last focused, else the selected one, else the first. Null for an empty list. */
export function conversationTabbable(ids: readonly string[], activeId: string | null, selectedId?: string): string | null {
  if (activeId !== null && ids.includes(activeId)) return activeId;
  if (selectedId !== undefined && ids.includes(selectedId)) return selectedId;
  return ids[0] ?? null;
}

/** Row index a key moves focus to, or null for keys that do nothing. ArrowUp/ArrowDown step, Home/End jump, and it stops at both ends. */
export function conversationRove(key: string, current: number, count: number): number | null {
  return roveIndex(key, current, count, { orientation: 'vertical', loop: false });
}

export interface ConversationListContextValue {
  /** Id of the row that is the list's tab stop. */
  tabbableId: string | null;
  /** Id of the open conversation, if the host gave one. */
  selectedId?: string;
}
export const ConversationListContext = createContext<ConversationListContextValue | null>(null);

const ROW = '[data-conversation-row]';

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

export function ConversationList({ label, children, order, selectedId }: ConversationListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const held = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = Children.toArray(children).filter((c): c is RowElement => isValidElement(c) && typeof (c.props as { id?: unknown }).id === 'string');
  const byId = new Map(items.map((c) => [c.props.id, c]));
  const shown = conversationOrder(
    items.map((c) => c.props.id),
    order,
  );
  const rows = shown.map((id) => cloneElement(byId.get(id) as RowElement, { key: id }));
  const orderKey = shown.join('\u0000');

  useFlip(ref, orderKey);

  /* Moving a focused row in the DOM can drop focus to the page. The row that held focus gets it back, so focus stays on the same conversation. */
  useLayoutEffect(() => {
    const id = held.current;
    const el = ref.current;
    if (!id || !el || el.contains(document.activeElement)) return;
    el.querySelector<HTMLElement>(`${ROW}[data-conversation-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  }, [orderKey]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const rowId = (target: EventTarget | null) => (target as HTMLElement | null)?.closest?.(ROW)?.getAttribute('data-conversation-id') ?? null;
  const onFocus = (e: { target: EventTarget | null }) => {
    const id = rowId(e.target);
    if (!id) return;
    if (timer.current) clearTimeout(timer.current);
    held.current = id;
    setActiveId(id);
  };
  const onBlur = () => {
    if (timer.current) clearTimeout(timer.current);
    /* A re-order blurs and refocuses within one task; only a blur that survives it is real. */
    timer.current = setTimeout(() => {
      if (!ref.current?.contains(document.activeElement)) held.current = null;
    }, 0);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!rowId(e.target)) return;
    roveFocus(e, ref.current, ROW, { orientation: 'vertical', loop: false });
  };

  const context: ConversationListContextValue = { tabbableId: conversationTabbable(shown, activeId, selectedId), selectedId };
  return (
    <ConversationListContext.Provider value={context}>
      <div ref={ref} role="list" aria-label={label} onFocusCapture={onFocus} onBlurCapture={onBlur} onKeyDown={onKeyDown} className="cieo cieo-conversation-list">
        {rows}
      </div>
    </ConversationListContext.Provider>
  );
}

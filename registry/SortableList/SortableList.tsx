// src/primitives/SortableList/SortableList.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* SortableList. Controlled drag-and-drop reorder: pointer or keyboard lifts an item, the list previews the move, onReorder fires once on drop. */
import { Children, cloneElement, createContext, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { useFlip } from '../../react/index.js';

export type SortableListTag = 'ul' | 'ol' | 'div' | 'tbody';

/** Returns order with id moved to index (clamped). Returns the same array when nothing moves. */
export function sortableMove(order: readonly string[], id: string, index: number): readonly string[] {
  const from = order.indexOf(id);
  if (from < 0) return order;
  const to = Math.max(0, Math.min(order.length - 1, index));
  if (to === from) return order;
  const next = order.filter((x) => x !== id);
  next.splice(to, 0, id);
  return next;
}

/** Target index for the dragged item: how many of the other items' midpoints the pointer has passed. */
export function sortableDropIndex(otherMidpoints: readonly number[], pointer: number): number {
  let index = 0;
  for (const mid of otherMidpoints) if (pointer > mid) index += 1;
  return index;
}

export type SortableEvent = 'lift' | 'move' | 'drop' | 'cancel';

/** Screen-reader sentence for a reorder step; position is 1-based. */
export function sortableAnnouncement(event: SortableEvent, name: string, position: number, total: number): string {
  const at = `position ${position} of ${total}`;
  if (event === 'lift') return `Picked up ${name}, ${at}. Arrow keys move it, Space or Enter drops it, Escape cancels.`;
  if (event === 'move') return `${name} moved to ${at}.`;
  if (event === 'drop') return `${name} dropped at ${at}.`;
  return `Reorder cancelled. ${name} is back at ${at}.`;
}

export interface SortableSession {
  id: string;
  via: 'pointer' | 'keyboard';
  order: readonly string[];
}

export type SortableAction =
  | { type: 'lift'; id: string; via: 'pointer' | 'keyboard' }
  | { type: 'moveTo'; index: number }
  | { type: 'moveBy'; delta: number }
  | { type: 'drop' }
  | { type: 'cancel' };

export interface SortableStep {
  session: SortableSession | null;
  event: SortableEvent | null;
  /** Order to hand to onReorder; set only when a drop changed something. */
  commit: readonly string[] | null;
  /** Item the step is about, for announcements. */
  id: string | null;
  /** The order the announcement position refers to. */
  order: readonly string[];
}

/** Keyboard key to action while an item is lifted; null for keys that do nothing. */
export function sortableKeyAction(key: string): SortableAction | null {
  if (key === ' ' || key === 'Enter') return { type: 'drop' };
  if (key === 'Escape') return { type: 'cancel' };
  if (key === 'ArrowUp' || key === 'ArrowLeft') return { type: 'moveBy', delta: -1 };
  if (key === 'ArrowDown' || key === 'ArrowRight') return { type: 'moveBy', delta: 1 };
  if (key === 'Home') return { type: 'moveTo', index: 0 };
  if (key === 'End') return { type: 'moveTo', index: Number.MAX_SAFE_INTEGER };
  return null;
}

/** Pure reorder state machine. `original` is the host's order; the session holds the live preview. */
export function sortableStep(session: SortableSession | null, action: SortableAction, original: readonly string[]): SortableStep {
  const idle: SortableStep = { session, event: null, commit: null, id: session?.id ?? null, order: session?.order ?? original };
  if (action.type === 'lift') {
    if (session || !original.includes(action.id)) return idle;
    const next = { id: action.id, via: action.via, order: [...original] };
    return { session: next, event: 'lift', commit: null, id: action.id, order: next.order };
  }
  if (!session) return idle;
  if (action.type === 'moveTo' || action.type === 'moveBy') {
    const index = action.type === 'moveTo' ? action.index : session.order.indexOf(session.id) + action.delta;
    const order = sortableMove(session.order, session.id, index);
    if (order === session.order) return idle;
    return { session: { ...session, order }, event: 'move', commit: null, id: session.id, order };
  }
  if (action.type === 'drop') {
    const changed = session.order.some((x, i) => x !== original[i]);
    return { session: null, event: 'drop', commit: changed ? session.order : null, id: session.id, order: session.order };
  }
  return { session: null, event: 'cancel', commit: null, id: session.id, order: original };
}

export interface SortableListContextValue {
  as: SortableListTag;
  session: SortableSession | null;
  order: readonly string[];
  /** Applies an action to the reorder session; name is read aloud. */
  dispatch: (action: SortableAction, name: string) => void;
}
export const SortableListContext = createContext<SortableListContextValue | null>(null);

export interface SortableListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the list (e.g. "Pipeline stages"). Required. */
  label: string;
  /** Item ids in display order. The list never reorders itself; it asks through onReorder. */
  order: string[];
  /** Called once with the next order when an item is dropped in a new place. */
  onReorder: (next: string[]) => void;
  /** Element to render: ul or ol for lists, div for generic rows, tbody for table rows. Defaults to ul. */
  as?: SortableListTag;
  /** Axis items travel along. Defaults to vertical. */
  orientation?: 'vertical' | 'horizontal';
  /** False skips the slide animation. Defaults to true; reduced-motion users never see it. */
  motion?: boolean;
  /** SortableListItem children, in any order; their ids and `order` decide where they appear. */
  children: ReactNode;
}

type ItemElement = ReactElement<{ id: string }>;

export function SortableList({ className, slotProps, label, order, onReorder, as = 'ul', orientation = 'vertical', motion, children }: SortableListProps) {
  const ref = useRef<HTMLElement>(null);
  const [session, setSession] = useState<SortableSession | null>(null);
  const [message, setMessage] = useState('');
  const region = useRef<HTMLElement | null>(null);
  const live = useRef({ session, order, onReorder, orientation });
  live.current = { session, order, onReorder, orientation };
  const refocus = useRef<string | null>(null);
  const shown = session?.order ?? order;

  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.style.cssText = 'position:absolute;inline-size:1px;block-size:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
    document.body.appendChild(el);
    region.current = el;
    return () => {
      el.remove();
      region.current = null;
    };
  }, []);
  useEffect(() => {
    if (region.current) region.current.textContent = message;
  }, [message]);

  const items = Children.toArray(children).filter((c): c is ItemElement => isValidElement(c) && typeof (c.props as { id?: unknown }).id === 'string');
  const byId = new Map(items.map((c) => [c.props.id, c]));
  const ordered = [...shown.filter((id) => byId.has(id)), ...items.map((c) => c.props.id).filter((id) => !shown.includes(id))].map((id) => cloneElement(byId.get(id) as ItemElement, { key: id }));

  useFlip(ref, motion === false ? 'static' : shown.join('\u0000'));

  useLayoutEffect(() => {
    const id = session?.via === 'keyboard' ? session.id : refocus.current;
    if (!id || !ref.current) return;
    const handle = [...ref.current.querySelectorAll<HTMLElement>('[data-sortable-handle]')].find((el) => el.dataset.sortableHandle === id);
    if (handle && document.activeElement !== handle) handle.focus({ preventScroll: true });
    if (!session) refocus.current = null;
  }, [session, shown]);

  const dispatch = (action: SortableAction, name: string) => {
    const cur = live.current;
    const step = sortableStep(cur.session, action, cur.order);
    if (step.event === null) return;
    if (step.event === 'drop' || step.event === 'cancel') refocus.current = cur.session?.via === 'keyboard' ? cur.session.id : null;
    live.current.session = step.session;
    setSession(step.session);
    if (step.id) setMessage(sortableAnnouncement(step.event, name, step.order.indexOf(step.id) + 1, step.order.length));
    if (step.commit) cur.onReorder([...step.commit]);
  };
  const api: SortableListContextValue = { as, session, order: shown, dispatch };
  const apiRef = useRef(api);
  apiRef.current = api;

  const pointerId = session?.via === 'pointer' ? session.id : null;
  useEffect(() => {
    if (!pointerId) return;
    const nameOf = () => ref.current?.querySelector<HTMLElement>(`[data-sortable-active="true"]`)?.dataset.sortableName ?? pointerId;
    const onMove = (e: PointerEvent) => {
      const kids = [...(ref.current?.children ?? [])] as HTMLElement[];
      const vertical = live.current.orientation === 'vertical';
      const mids = kids.filter((el) => el.dataset.sortableId !== pointerId).map((el) => {
        const r = el.getBoundingClientRect();
        return vertical ? r.top + r.height / 2 : r.left + r.width / 2;
      });
      apiRef.current.dispatch({ type: 'moveTo', index: sortableDropIndex(mids, vertical ? e.clientY : e.clientX) }, nameOf());
    };
    const onUp = () => apiRef.current.dispatch({ type: 'drop' }, nameOf());
    const onCancel = () => apiRef.current.dispatch({ type: 'cancel' }, nameOf());
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onCancel();
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('keydown', onKey);
    };
  }, [pointerId]);

  const Tag = as as 'ul';
  return (
    <SortableListContext.Provider value={api}>
      <Tag ref={ref as never} aria-label={label} data-orientation={orientation} data-sorting={session ? session.via : undefined} data-motion={motion === false ? 'off' : undefined} className="cieo cieo-sortable-list" {...customizePart(slotProps?.root, "cieo cieo-sortable-list", undefined, className)}>
        {ordered}
      </Tag>
    </SortableListContext.Provider>
  );
}

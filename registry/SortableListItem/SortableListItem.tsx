// src/primitives/SortableListItem/SortableListItem.tsx
'use client';
/* SortableListItem. One reorderable row inside SortableList. Its handle is the only drag and keyboard target; children are the row content. */
import { useContext, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { SortableListContext, sortableKeyAction } from '../SortableList/SortableList.js';

export interface SortableListItemProps {
  /** Stable id matching an entry in the list's order. Required. */
  id: string;
  /** Name used in screen-reader announcements and the handle label. Defaults to the id. */
  label?: string;
  /** Handle content. Defaults to a grip glyph. */
  handle?: ReactNode;
  /** Takes the item out of reordering. Defaults to false. */
  disabled?: boolean;
  /** Row content. For a tbody list, supply the cells. */
  children: ReactNode;
}

export function SortableListItem({ id, label, handle, disabled = false, children }: SortableListItemProps) {
  const list = useContext(SortableListContext);
  const name = label ?? id;
  const active = list?.session?.id === id;
  const lifted = active && list?.session?.via === 'keyboard';
  const position = list ? list.order.indexOf(id) + 1 : 0;

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (!list || disabled || (e.pointerType === 'mouse' && e.button !== 0) || list.session) return;
    e.preventDefault();
    list.dispatch({ type: 'lift', id, via: 'pointer' }, name);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!list || disabled) return;
    if (!lifted) {
      if (!list.session && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); list.dispatch({ type: 'lift', id, via: 'keyboard' }, name); }
      return;
    }
    const action = sortableKeyAction(e.key);
    if (!action) return;
    e.preventDefault();
    list.dispatch(action, name);
  };
  const onBlur = (e: { relatedTarget: EventTarget | null; currentTarget: Element }) => {
    if (lifted && e.relatedTarget && e.relatedTarget !== e.currentTarget) list?.dispatch({ type: 'cancel' }, name);
  };

  const grip = (
    <button
      type="button"
      data-sortable-handle={id}
      aria-label={`Reorder ${name}`}
      aria-pressed={lifted}
      aria-roledescription="sortable handle"
      title={position ? `Position ${position} of ${list?.order.length}` : undefined}
      disabled={disabled}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className="cieo-sortable-list-handle"
    >
      {handle ?? <span aria-hidden="true">⠿</span>}
    </button>
  );
  const attrs = { 'data-sortable-id': id, 'data-sortable-name': name, 'data-sortable-active': active ? 'true' : undefined, 'data-dragging': active ? list?.session?.via : undefined, 'data-disabled': disabled || undefined, className: 'cieo cieo-sortable-list-item' };
  if (list?.as === 'tbody') {
    return (<tr {...attrs}><td className="cieo-sortable-list-handle-cell">{grip}</td>{children}</tr>);
  }
  const Tag = list?.as === 'div' ? 'div' : 'li';
  return (<Tag {...attrs}>{grip}<div className="cieo-sortable-list-body">{children}</div></Tag>);
}

// src/primitives/CommentThread/CommentThread.tsx
'use client';
/* CommentThread. Tree manager for comments: nested lists, depth cap, "view more replies" per branch. The host renders every comment; this owns structure, expansion and reveal motion. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useFlip, useReducedMotion } from '../../react/index.js';

export type CommentNode<T = unknown> = T & { id: string; children?: CommentNode<T>[] };

export interface FlatComment {
  id: string;
  parentId?: string | null;
}

const MAX_COMMENT_DEPTH = 32;

/** Turns a flat list into a tree. Keeps input order, orphans (unknown parent) become roots, and cycles are broken so it always terminates. Duplicate ids keep the first. */
export function buildCommentTree<T extends FlatComment>(flat: readonly T[]): CommentNode<T>[] {
  const nodes = new Map<string, CommentNode<T>>();
  for (const item of flat) if (!nodes.has(item.id)) nodes.set(item.id, { ...item, children: [] });
  const componentParent = new Map<string, string>();
  const componentSize = new Map<string, number>();
  for (const id of nodes.keys()) {
    componentParent.set(id, id);
    componentSize.set(id, 1);
  }
  const find = (id: string): string => {
    let root = id;
    while (componentParent.get(root) !== root) root = componentParent.get(root)!;
    let current = id;
    while (current !== root) {
      const next = componentParent.get(current)!;
      componentParent.set(current, root);
      current = next;
    }
    return root;
  };
  const join = (left: string, right: string): boolean => {
    let leftRoot = find(left);
    let rightRoot = find(right);
    if (leftRoot === rightRoot) return false;
    if (componentSize.get(leftRoot)! < componentSize.get(rightRoot)!) [leftRoot, rightRoot] = [rightRoot, leftRoot];
    componentParent.set(rightRoot, leftRoot);
    componentSize.set(leftRoot, componentSize.get(leftRoot)! + componentSize.get(rightRoot)!);
    return true;
  };
  const roots: CommentNode<T>[] = [];
  const seen = new Set<string>();
  for (const item of flat) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const node = nodes.get(item.id) as CommentNode<T>;
    const pid = item.parentId;
    const parent = typeof pid === 'string' && pid !== item.id ? nodes.get(pid) : undefined;
    if (parent && join(item.id, parent.id)) {
      (parent.children as CommentNode<T>[]).push(node);
    } else roots.push(node);
  }
  return roots;
}

/** Number of nodes below `node`, at any depth. Safe on malformed data: a node is counted once. */
export function countDescendants(node: { id?: string; children?: readonly unknown[] } | null | undefined): number {
  if (!node) return 0;
  const seen = new Set<unknown>([node]);
  const stack: unknown[] = [...(node.children ?? [])];
  let count = 0;
  while (stack.length) {
    const next = stack.pop() as { children?: readonly unknown[] };
    if (!next || seen.has(next)) continue;
    seen.add(next);
    count += 1;
    if (next.children) stack.push(...next.children);
  }
  return count;
}

/** Replies to show now, and how many stay hidden. Expanded shows everything; otherwise only the first `initial` (a whole number of at least 0). */
export function visibleReplies<N>(children: readonly N[] | undefined, expanded: boolean, initial: number): { visible: N[]; hidden: number } {
  const all = children ?? [];
  const first = Number.isFinite(initial) ? Math.max(0, Math.floor(initial)) : 2;
  if (expanded || first >= all.length) return { visible: [...all], hidden: 0 };
  return { visible: all.slice(0, first), hidden: all.length - first };
}

/** Depth-first list of every node below `children`, each stripped of its own children. Used past the depth cap. */
export function flattenReplies<N extends { children?: N[] }>(children: readonly N[] | undefined): N[] {
  const out: N[] = [];
  const guard = new Set<N>();
  const stack: N[] = [];
  const initial = children ?? [];
  for (let index = initial.length - 1; index >= 0; index -= 1) stack.push(initial[index]!);
  while (stack.length) {
    const node = stack.pop()!;
    if (guard.has(node)) continue;
    guard.add(node);
    out.push({ ...node, children: undefined } as N);
    const nested = node.children ?? [];
    for (let index = nested.length - 1; index >= 0; index -= 1) stack.push(nested[index]!);
  }
  return out;
}

/** Default label for the reveal button. */
export function moreRepliesLabel(count: number): string {
  return count === 1 ? 'View 1 more reply' : `View ${count} more replies`;
}

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
  /** Deepest nesting level, capped at 32. Replies below it show at this level, flattened in order. Defaults to 3. */
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

interface Shared<T> {
  renderItem: CommentThreadProps<T>['renderItem'];
  maxDepth: number;
  initial: number;
  moreLabel: (hidden: number) => string;
  fresh: ReadonlySet<string>;
  branchLabel?: (parent: CommentNode<T>) => string;
  isOpen: (id: string) => boolean;
  open: (id: string) => void;
}

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function levelEntries<T>(children: CommentNode<T>[] | undefined, level: number, maxDepth: number): CommentNode<T>[] {
  if (!children?.length) return [];
  return level >= maxDepth ? flattenReplies<CommentNode<T>>(children) : children;
}

function Branch<T>({ shared, parent, entries, depth }: { shared: Shared<T>; parent?: CommentNode<T>; entries: CommentNode<T>[]; depth: number }) {
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const expanded = parent ? shared.isOpen(parent.id) : true;
  const { visible, hidden } = visibleReplies(entries, expanded, shared.initial);
  const from = useRef<number | null>(null);
  const revealed = useRef(false);
  const shown = useRef(visible.length);
  useFlip(list, visible.map((n) => n.id).join('\u0000'));
  useIso(() => {
    const el = box.current;
    const startedAt = from.current;
    from.current = null;
    if (!el || startedAt === null) return;
    const to = el.scrollHeight;
    const off = typeof el.closest === 'function' && el.closest("[data-motion='off']");
    if (reduced || off || typeof el.animate !== 'function' || to === startedAt) return;
    el.style.overflow = 'hidden';
    const run = el.animate([{ blockSize: `${startedAt}px` }, { blockSize: `${to}px` }], { duration: 300, easing: 'cubic-bezier(.2,.15,.2,1)' });
    const clear = () => {
      el.style.overflow = '';
    };
    run.onfinish = clear;
    run.oncancel = clear;
  }, [expanded]);
  useEffect(() => {
    if (revealed.current && visible.length > shown.current) {
      (list.current?.children[shown.current] as HTMLElement | undefined)?.focus({ preventScroll: true });
    }
    revealed.current = false;
    shown.current = visible.length;
  });
  const reveal = () => {
    if (!parent) return;
    from.current = box.current?.offsetHeight ?? null;
    revealed.current = true;
    shared.open(parent.id);
  };
  return (
    <div ref={box} className="cieo-comment-thread-branch" data-depth={depth}>
      <ul ref={list} role="list" className="cieo-comment-thread-list" aria-label={parent && shared.branchLabel ? shared.branchLabel(parent) : undefined}>
        {visible.map((node) => {
          const kids = levelEntries(node.children, depth + 1, shared.maxDepth);
          const own = visibleReplies(kids, shared.isOpen(node.id), shared.initial);
          return (
            <li key={node.id} tabIndex={-1} className="cieo-comment-thread-item" data-new={shared.fresh.has(node.id) ? '' : undefined}>
              {shared.renderItem(node, {
                depth,
                hasReplies: kids.length > 0,
                hiddenCount: own.hidden,
                replies: kids.length > 0 ? <Branch shared={shared} parent={node} entries={kids} depth={depth + 1} /> : null,
              })}
            </li>
          );
        })}
      </ul>
      {hidden > 0 ? (
        <button type="button" className="cieo-comment-thread-more" onClick={reveal}>
          {shared.moreLabel(hidden)}
        </button>
      ) : null}
    </div>
  );
}

export function CommentThread<T = unknown>({ label, items, renderItem, maxDepth = 3, initialReplies = 2, moreLabel = moreRepliesLabel, newIds, branchLabel, expanded, onExpandedChange }: CommentThreadProps<T>) {
  const [inner, setInner] = useState<string[]>([]);
  const open = expanded ?? inner;
  const live = useRef({ open, onExpandedChange });
  live.current = { open, onExpandedChange };
  const shared: Shared<T> = {
    renderItem,
    maxDepth: Number.isFinite(maxDepth) ? Math.min(MAX_COMMENT_DEPTH, Math.max(0, Math.floor(maxDepth))) : 3,
    initial: initialReplies,
    moreLabel,
    fresh: new Set(newIds ?? []),
    branchLabel,
    isOpen: (id) => open.includes(id),
    open: (id) => {
      const cur = live.current;
      if (cur.open.includes(id)) return;
      const next = [...cur.open, id];
      if (cur.onExpandedChange) cur.onExpandedChange(next);
      if (expanded === undefined) setInner(next);
    },
  };
  const roots = levelEntries(items, 0, shared.maxDepth);
  return (
    <section aria-label={label} className="cieo cieo-comment-thread">
      <Branch shared={shared} entries={roots} depth={0} />
    </section>
  );
}

// src/primitives/ByLine/ByLine.tsx
'use client';
/* ByLine. One-line author header: name, badge, context crumb and relative time. The host owns the text; this owns truncation order and safe links. */
import type { ReactNode } from 'react';
import { safeHref } from '../Mention/Mention.js';

export interface ByLineProps {
  /** Display name of the author. Truncates before the time does. Required. */
  author: string;
  /** Profile link. Only http(s) and relative links become anchors; anything else renders as plain text. */
  href?: string;
  /** Slot after the name, such as a verified badge. */
  badge?: ReactNode;
  /** Slot for where the post lives (a topic, a thread title), shown after a "›" separator. */
  context?: ReactNode;
  /** Link for the context crumb, with the same safe-link rule as `href`. */
  contextHref?: string;
  /** Display text for the age, such as "1d". Muted, never truncated. */
  time?: string;
  /** Machine-readable date (ISO 8601) written to the time element. */
  dateTime?: string;
  /** Account handle without the at sign; shown muted after the name when there is room. */
  handle?: string;
  /** Id placed on the root so a parent can label itself by this line. */
  id?: string;
}

function Linked({ href, className, children }: { href?: string; className: string; children: ReactNode }) {
  const safe = safeHref(href) ?? undefined;
  return safe ? (
    <a className={className} href={safe}>
      {children}
    </a>
  ) : (
    <span className={className}>{children}</span>
  );
}

export function ByLine({ author, href, badge, context, contextHref, time, dateTime, handle, id }: ByLineProps) {
  const hasContext = context !== undefined && context !== null && context !== false;
  return (
    <span id={id} className="cieo cieo-by-line">
      <Linked href={href} className="cieo-by-line-author">
        {author}
      </Linked>
      {badge ? <span className="cieo-by-line-badge">{badge}</span> : null}
      {handle ? <span className="cieo-by-line-handle">@{handle}</span> : null}
      {hasContext ? (
        <>
          <span className="cieo-by-line-sep" aria-hidden="true">
            ›
          </span>
          <Linked href={contextHref} className="cieo-by-line-context">
            {context}
          </Linked>
        </>
      ) : null}
      {time ? (
        <>
          <span className="cieo-by-line-sep" aria-hidden="true">
            ·
          </span>
          <time className="cieo-by-line-time" dateTime={dateTime}>
            {time}
          </time>
        </>
      ) : null}
    </span>
  );
}

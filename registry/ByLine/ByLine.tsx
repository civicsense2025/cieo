// src/primitives/ByLine/ByLine.tsx
'use client';
/* ByLine. One-line author header: name, badge, context crumb and relative time. The host owns the text; this owns truncation order and safe links. */
import type { ReactNode } from 'react';
import { safeHref } from '../Mention/Mention.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ByLineProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; badge?: PrimitivePartProps; handle?: PrimitivePartProps; separator?: PrimitivePartProps; time?: PrimitivePartProps };

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

export function ByLine({ className, slotProps, author, href, badge, context, contextHref, time, dateTime, handle, id }: ByLineProps) {
  const hasContext = context !== undefined && context !== null && context !== false;
  return (
    <span id={id} className="cieo cieo-by-line" {...customizePart(slotProps?.root, "cieo cieo-by-line", undefined, className)}>
      <Linked href={href} className="cieo-by-line-author">
        {author}
      </Linked>
      {badge ? <span className="cieo-by-line-badge" {...customizePart(slotProps?.badge, "cieo-by-line-badge", undefined)}>{badge}</span> : null}
      {handle ? <span className="cieo-by-line-handle" {...customizePart(slotProps?.handle, "cieo-by-line-handle", undefined)}>@{handle}</span> : null}
      {hasContext ? (
        <>
          <span className="cieo-by-line-sep" aria-hidden="true" {...customizePart(slotProps?.separator, "cieo-by-line-sep", undefined)}>
            ›
          </span>
          <Linked href={contextHref} className="cieo-by-line-context">
            {context}
          </Linked>
        </>
      ) : null}
      {time ? (
        <>
          <span className="cieo-by-line-sep" aria-hidden="true" {...customizePart(slotProps?.separator, "cieo-by-line-sep", undefined)}>
            ·
          </span>
          <time className="cieo-by-line-time" dateTime={dateTime} {...customizePart(slotProps?.time, "cieo-by-line-time", undefined)}>
            {time}
          </time>
        </>
      ) : null}
    </span>
  );
}

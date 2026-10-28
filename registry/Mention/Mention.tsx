// src/primitives/Mention/Mention.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Mention. An @handle inside post text: a link when the host gives a safe address, plain text otherwise. */

/** Handle without a leading @ and surrounding space. Empty when the input is blank or contains whitespace. */
export function normalizeHandle(raw: string): string {
  const trimmed = String(raw ?? '').trim();
  const bare = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  if (bare === '' || /\s/.test(bare)) return '';
  return bare;
}

/** The address when it is safe to put in an href, else null. User content is untrusted, so only credential-free http and https URLs with a host pass, plus same-site relative links (/path, ./path, ../path, #hash or ?query) unless `relative` is false. Protocol-relative (//host) and backslash tricks are refused because browsers resolve them to another site. */
export function safeHref(href: unknown, opts: { relative?: boolean } = {}): string | null {
  if (typeof href !== 'string') return null;
  const value = href.trim();
  // eslint-disable-next-line no-control-regex
  if (value === '' || /[\u0000-\u001f\u007f]/.test(value)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    try {
      const url = new URL(value);
      return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '' && url.username === '' && url.password === '' ? value : null;
    } catch {
      return null;
    }
  }
  if (opts.relative === false) return null;
  // Explicit same-site forms only; a bare "x.com/a" is almost always a mistyped outside address.
  return /^(?:\/(?![/\\])|#|\?|\.{1,2}\/)/.test(value) ? value : null;
}

export interface MentionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Account handle, with or without the leading @. */
  handle: string;
  /** Profile address. Only http, https and same-site paths become a link; anything else renders as text. */
  href?: string;
  /** Display name, shown as the tooltip. */
  name?: string;
}

export function Mention({ className, slotProps, handle, href, name }: MentionProps) {
  const clean = normalizeHandle(handle);
  if (clean === '') return null;
  const safe = href === undefined ? null : safeHref(href);
  const text = `@${clean}`;
  return safe ? (
    <a className="cieo cieo-mention" href={safe} title={name} {...customizePart(slotProps?.root, "cieo cieo-mention", undefined, className)}>
      {text}
    </a>
  ) : (
    <span className="cieo cieo-mention" title={name} {...customizePart(slotProps?.root, "cieo cieo-mention", undefined, className)}>
      {text}
    </span>
  );
}

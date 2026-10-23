// src/primitives/RichText/RichText.tsx
'use client';
/* RichText. Turns plain post text into safe inline nodes: links, @mentions, #tags and line breaks. Never injects HTML; only http(s) becomes a link. */
import { Fragment, type ReactNode } from 'react';
import { Mention, safeHref } from '../Mention/Mention.js';

export type RichTextTokenType = 'text' | 'url' | 'mention' | 'tag' | 'break';

export interface RichTextToken {
  type: RichTextTokenType;
  /** The text as written (a URL keeps its original spelling). */
  value: string;
  /** Full address for url tokens, always http or https. */
  href?: string;
}

const TRAILING = new Set(['.', ',', ';', ':', '!', '?', '"', "'", '’', '”', '…', ']', '}']);
const count = (s: string, ch: string) => s.split(ch).length - 1;

/** Splits a matched address from the punctuation that ends the sentence around it. Parentheses are counted once, so the work is linear. */
export function trimUrl(raw: string): { url: string; rest: string } {
  let end = raw.length;
  let open = count(raw, '(');
  let close = count(raw, ')');
  while (end > 0) {
    const last = raw[end - 1]!;
    if (TRAILING.has(last)) end -= 1;
    else if (last === ')' && close > open) {
      close -= 1;
      end -= 1;
    } else break;
  }
  return { url: raw.slice(0, end), rest: raw.slice(end) };
}

/** Full http(s) address for a matched url, or null when it is not a safe web address. */
function toHref(url: string): string | null {
  const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const safe = safeHref(full, { relative: false });
  if (!safe) return null;
  try {
    const parsed = new URL(safe);
    // A name or password before the host can pass one site off as another in the link text.
    if (parsed.username !== '' || parsed.password !== '') return null;
    return parsed.hostname.includes('.') || /^https?:\/\/localhost\b/i.test(safe) ? safe : null;
  } catch {
    return null;
  }
}

const PATTERN = new RegExp(
  [
    '(?<break>\\r\\n|\\r|\\n)',
    '(?<url>https?:\\/\\/[^\\s<>]+|(?<![\\p{L}\\p{N}_@./:#%-])(?:www\\.)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}\\/[^\\s<>]*)',
    '(?<mention>(?<![\\p{L}\\p{N}!#$%&\'*+\\-/=?^_`{|}~@.:"])@[\\p{L}\\p{N}_](?:[\\p{L}\\p{N}_.]{0,28}[\\p{L}\\p{N}_])?(?![\\p{L}\\p{N}_-]))',
    '(?<tag>(?<![\\p{L}\\p{N}_&#/])#\\p{L}[\\p{L}\\p{N}_]*)',
  ].join('|'),
  'giu',
);

/** Splits post text into text, url, mention, tag and break tokens. Pure; the same input always gives the same tokens, and joining every value rebuilds the text (breaks as newlines). */
export function tokenizeRichText(text: string): RichTextToken[] {
  const out: RichTextToken[] = [];
  const pushText = (value: string) => {
    if (value === '') return;
    const prev = out[out.length - 1];
    if (prev && prev.type === 'text') prev.value += value;
    else out.push({ type: 'text', value });
  };
  const source = String(text ?? '');
  let cursor = 0;
  for (const m of source.matchAll(PATTERN)) {
    const at = m.index ?? 0;
    pushText(source.slice(cursor, at));
    cursor = at + m[0].length;
    const g = m.groups ?? {};
    if (g.break !== undefined) out.push({ type: 'break', value: '\n' });
    else if (g.url !== undefined) {
      const { url, rest } = trimUrl(g.url);
      const href = toHref(url);
      if (href) {
        out.push({ type: 'url', value: url, href });
        pushText(rest);
      } else pushText(g.url);
    } else if (g.mention !== undefined) out.push({ type: 'mention', value: g.mention });
    else if (g.tag !== undefined) out.push({ type: 'tag', value: g.tag });
  }
  pushText(source.slice(cursor));
  return out;
}

/** Display form of an address: no scheme, no www., end ellipsized so the result is at most `max` characters. */
export function shortenUrl(url: string, max = 28): string {
  const bare = String(url ?? '')
    .trim()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
  const limit = Math.max(1, Math.floor(Number.isFinite(max) ? max : 28));
  const chars = Array.from(bare);
  return chars.length <= limit ? bare : `${chars.slice(0, limit - 1).join('')}…`;
}

export interface RichTextProps {
  /** Plain post text. Rendered as text nodes, never as HTML. */
  text: string;
  /** Address builders for @mentions and #tags. Without them mentions are plain text and tags are not links. */
  hrefFor?: {
    mention?: (handle: string) => string;
    tag?: (tag: string) => string;
  };
  /** Longest visible link text before it is ellipsized. Defaults to 28. */
  maxUrlLength?: number;
}

export function RichText({ text, hrefFor, maxUrlLength = 28 }: RichTextProps) {
  const nodes: ReactNode[] = tokenizeRichText(text).map((t, i): ReactNode => {
    if (t.type === 'break') return <br key={i} />;
    if (t.type === 'url' && t.href)
      return (
        <a key={i} className="cieo-rich-text-link" href={t.href} title={t.href} target="_blank" rel="noopener noreferrer ugc nofollow">
          {shortenUrl(t.value, maxUrlLength)}
        </a>
      );
    if (t.type === 'mention') {
      const handle = t.value.slice(1);
      return <Mention key={i} handle={handle} href={hrefFor?.mention?.(handle)} />;
    }
    if (t.type === 'tag') {
      const tag = t.value.slice(1);
      const href = safeHref(hrefFor?.tag?.(tag));
      return href ? (
        <a key={i} className="cieo-rich-text-tag" href={href}>
          {t.value}
        </a>
      ) : (
        <span key={i} className="cieo-rich-text-tag">
          {t.value}
        </span>
      );
    }
    return <Fragment key={i}>{t.value}</Fragment>;
  });
  return <span className="cieo cieo-rich-text">{nodes}</span>;
}

// src/primitives/ShareButton/ShareButton.tsx
'use client';
/* ShareButton. Opens the device share sheet, or copies the link where there is none, and says what happened. The host owns the URL and any analytics. */
import { useEffect, useRef, useState } from 'react';
import { SwapText } from '../../react/index.js';
import { safeHref } from '../Mention/Mention.js';

export type ShareMethod = 'native' | 'copy' | 'none';
export type ShareNavigator = { share?: unknown; clipboard?: { writeText?: unknown } };
export type ShareOutcome = 'native' | 'copy' | 'cancelled' | 'failed' | 'unavailable';

/** How a link can be shared here: the native sheet first, then the clipboard, otherwise not at all. */
export function shareMethod(nav: ShareNavigator | undefined): ShareMethod {
  if (nav && typeof nav.share === 'function') return 'native';
  if (nav && typeof nav.clipboard?.writeText === 'function') return 'copy';
  return 'none';
}

/** True only for absolute http and https URLs; anything else (javascript:, data:, relative paths) is never shared. */
export function isShareableUrl(url: string): boolean {
  return safeHref(url, { relative: false }) !== null;
}

/** Shares through the best method. A user cancelling the native sheet is `cancelled`, not an error; any other native failure falls back to copying. */
export async function runShare(nav: ShareNavigator | undefined, data: { url: string; title?: string; text?: string }): Promise<ShareOutcome> {
  if (!isShareableUrl(data.url)) return 'unavailable';
  const method = shareMethod(nav);
  if (method === 'none' || !nav) return 'unavailable';
  if (method === 'native') {
    try {
      await (nav.share as (d: object) => Promise<void>)({ url: data.url, ...(data.title ? { title: data.title } : {}), ...(data.text ? { text: data.text } : {}) });
      return 'native';
    } catch (error) {
      if ((error as { name?: string } | null)?.name === 'AbortError') return 'cancelled';
      if (typeof nav.clipboard?.writeText !== 'function') return 'failed';
    }
  }
  try {
    await (nav.clipboard!.writeText as (s: string) => Promise<void>).call(nav.clipboard, data.url);
    return 'copy';
  } catch {
    return 'failed';
  }
}

/** How long "Link copied" stays before the label returns, in milliseconds. */
export const SHARE_COPIED_MS = 2000;

export interface ShareButtonProps {
  /** Absolute http(s) URL to share. Other schemes disable the button. */
  url: string;
  /** Title passed to the native share sheet. */
  title?: string;
  /** Text passed to the native share sheet. */
  text?: string;
  /** Visible label. Defaults to "Share". */
  label?: string;
  /** Called after a share succeeds, with how it happened. Not called on cancel or failure. */
  onShared?: (method: 'native' | 'copy') => void;
}

export function ShareButton({ url, title, text, label = 'Share', onShared }: ShareButtonProps) {
  const [available, setAvailable] = useState(true);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valid = isShareableUrl(url);
  useEffect(() => {
    setAvailable(shareMethod(typeof navigator === 'undefined' ? undefined : navigator) !== 'none');
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  async function press() {
    const outcome = await runShare(typeof navigator === 'undefined' ? undefined : navigator, { url, title, text });
    if (outcome === 'native') onShared?.('native');
    else if (outcome === 'copy') {
      setCopied(true);
      setMessage('Link copied');
      onShared?.('copy');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { setCopied(false); setMessage(''); }, SHARE_COPIED_MS);
    } else if (outcome === 'failed' || outcome === 'unavailable') setMessage('Could not share the link');
  }
  return (
    <span className="cieo cieo-share-button-wrap">
      <button type="button" className="cieo cieo-share-button" data-copied={copied ? '' : undefined} disabled={!valid || !available} onClick={press}>
        <svg className="cieo-share-button-icon" aria-hidden="true" viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>
        <SwapText value={copied ? 'Link copied' : label} />
      </button>
      <span className="cieo-sr-only" role="status" aria-live="polite">{message}</span>
    </span>
  );
}

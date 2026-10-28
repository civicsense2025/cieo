// src/primitives/CommentComposer/CommentComposer.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* CommentComposer. Input row for a thread: autosizing text, tool and attachment slots, a recorder slot, reply context and a character ring. Host owns the value, the media and what submit does. */
import { useEffect, useLayoutEffect, useRef, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { SwapText, useSwap } from '../../react/index.js';
import { CharacterCountRing } from '../CharacterCountRing/CharacterCountRing.js';
import { ReplyPreview } from '../ReplyPreview/ReplyPreview.js';

export interface CommentComposerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; reply?: PrimitivePartProps; row?: PrimitivePartProps; avatar?: PrimitivePartProps; main?: PrimitivePartProps; panes?: PrimitivePartProps; pane?: PrimitivePartProps; input?: PrimitivePartProps; attachments?: PrimitivePartProps; bar?: PrimitivePartProps; tools?: PrimitivePartProps; submit?: PrimitivePartProps };

  /** Current text. Host-controlled. Required. */
  value: string;
  /** Called with the next text on every edit. Required. */
  onValueChange: (value: string) => void;
  /** Called with the trimmed text when the person posts (button or Cmd/Ctrl+Enter) and posting is allowed. Required. */
  onSubmit: (value: string) => void;
  /** Hint shown while empty. Defaults to "Add to thread…". */
  placeholder?: string;
  /** Accessible name for the form and the input. Defaults to "Add to thread". */
  label?: string;
  /** Slot: the author's avatar, left of the input. */
  avatar?: ReactNode;
  /** Slot: icon buttons under the input (image, sticker, GIF, expand, mic, or anything else). */
  tools?: ReactNode;
  /** Slot: previews of attached media, such as images or a recorded clip's player. */
  attachments?: ReactNode;
  /** True when attachments exist, so posting is allowed with empty text. */
  hasAttachments?: boolean;
  /** Slot: when present it replaces the text input (voice-recording mode). Focus moves into it, and back to the input when it leaves. */
  recorder?: ReactNode;
  /** The comment being answered; shows a quote above the input. */
  replyingTo?: { author: string; excerpt: string };
  /** Called when the reply quote is dismissed (button, or Escape in the input). */
  onCancelReply?: () => void;
  /** Character limit. The count ring appears at 80% and posting stops past the limit. */
  maxLength?: number;
  /** Text of the post button. Defaults to "Post". */
  submitLabel?: string;
  /** True while a post is in flight: the button reads "Posting…" and posting is blocked. */
  pending?: boolean;
  /** Blocks all input and posting. */
  disabled?: boolean;
}

export interface ComposerState {
  value: string;
  hasAttachments?: boolean;
  maxLength?: number;
  pending?: boolean;
  disabled?: boolean;
}

/** Length in characters as a person counts them (emoji count once). */
export function composerLength(value: string): number {
  let n = 0;
  for (const _ of value) n += 1;
  return n;
}

/** Posting is allowed when not busy or disabled, within the limit, and there is text or an attachment. */
export function composerCanSubmit({ value, hasAttachments, maxLength, pending, disabled }: ComposerState): boolean {
  if (pending || disabled) return false;
  if (typeof maxLength === 'number' && maxLength > 0 && composerLength(value) > maxLength) return false;
  return value.trim() !== '' || Boolean(hasAttachments);
}

/** The count ring appears once `threshold` (default 80%) of the limit is used. No limit, no ring. */
export function composerShowsCount(length: number, maxLength: number | undefined, threshold = 0.8): boolean {
  return typeof maxLength === 'number' && maxLength > 0 && length >= maxLength * threshold;
}

/** Keyboard map for the text input: Cmd/Ctrl+Enter posts, Escape cancels a reply. Enter alone is a newline. Composition (IME) keystrokes never act. */
export function composerKeyAction(e: { key: string; metaKey?: boolean; ctrlKey?: boolean; isComposing?: boolean }, replying: boolean): 'submit' | 'cancel-reply' | null {
  if (e.isComposing) return null;
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) return 'submit';
  if (e.key === 'Escape' && replying) return 'cancel-reply';
  return null;
}

type Pane = 'text' | 'recorder';
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function CommentComposer({ className, slotProps, value, onValueChange, onSubmit, placeholder = 'Add to thread…', label = 'Add to thread', avatar, tools, attachments, hasAttachments, recorder, replyingTo, onCancelReply, maxLength, submitLabel = 'Post', pending, disabled }: CommentComposerProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  const recorderPane = useRef<HTMLDivElement>(null);
  const lastRecorder = useRef<ReactNode>(null);
  const had = useRef(Boolean(recorder));
  if (recorder) lastRecorder.current = recorder;
  const want: Pane = recorder ? 'recorder' : 'text';
  const { shown, leaving, key, done } = useSwap<Pane>(want);

  const length = composerLength(value);
  const can = composerCanSubmit({ value, hasAttachments, maxLength, pending, disabled });
  const submit = () => {
    if (composerCanSubmit({ value, hasAttachments, maxLength, pending, disabled })) onSubmit(value.trim());
  };

  useIso(() => {
    const el = input.current;
    if (!el) return;
    el.style.blockSize = 'auto';
    el.style.blockSize = `${el.scrollHeight}px`;
  }, [value, shown]);

  useEffect(() => {
    const has = Boolean(recorder);
    if (has === had.current) return;
    had.current = has;
    if (has) {
      const pane = recorderPane.current;
      const target = pane?.querySelector<HTMLElement>(FOCUSABLE) ?? pane;
      target?.focus({ preventScroll: true });
    } else input.current?.focus({ preventScroll: true });
  }, [recorder]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const action = composerKeyAction({ key: e.key, metaKey: e.metaKey, ctrlKey: e.ctrlKey, isComposing: e.nativeEvent.isComposing }, Boolean(replyingTo && onCancelReply));
    if (action === 'submit') {
      e.preventDefault();
      submit();
    } else if (action === 'cancel-reply') {
      e.preventDefault();
      onCancelReply?.();
    }
  };
  const onForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };
  const onPaneEnd = (e: { target: unknown; currentTarget: unknown }) => {
    if (e.target === e.currentTarget) done(key);
  };

  const textVisible = shown === 'text' || leaving === 'text';
  const recorderVisible = (shown === 'recorder' && Boolean(recorder)) || leaving === 'recorder';
  const phase = (pane: Pane) => (leaving === pane ? 'leave' : shown === pane && leaving !== null ? 'enter' : 'rest');

  return (
    <form aria-label={label} onSubmit={onForm} className="cieo cieo-comment-composer" data-disabled={disabled ? '' : undefined} {...customizePart(slotProps?.root, "cieo cieo-comment-composer", undefined, className)}>
      {replyingTo ? (
        <div className="cieo-comment-composer-reply" {...customizePart(slotProps?.reply, "cieo-comment-composer-reply")}>
          <ReplyPreview variant="composer" author={replyingTo.author} excerpt={replyingTo.excerpt} onDismiss={onCancelReply} />
        </div>
      ) : null}
      <div className="cieo-comment-composer-row" {...customizePart(slotProps?.row, "cieo-comment-composer-row")}>
        {avatar ? <div className="cieo-comment-composer-avatar" {...customizePart(slotProps?.avatar, "cieo-comment-composer-avatar")}>{avatar}</div> : null}
        <div className="cieo-comment-composer-main" {...customizePart(slotProps?.main, "cieo-comment-composer-main")}>
          <div className="cieo-comment-composer-panes" {...customizePart(slotProps?.panes, "cieo-comment-composer-panes")}>
            {textVisible ? (
              <div className="cieo-comment-composer-pane" data-pane="text" data-phase={phase('text')} inert={leaving === 'text' || undefined} onAnimationEnd={leaving === 'text' ? onPaneEnd : undefined} {...customizePart(slotProps?.pane, "cieo-comment-composer-pane")}>
                <textarea ref={input} rows={1} value={value} aria-label={label} placeholder={placeholder} disabled={disabled} onChange={(e) => onValueChange(e.target.value)} onKeyDown={onKeyDown} className="cieo-comment-composer-input" {...customizePart(slotProps?.input, "cieo-comment-composer-input")} />
              </div>
            ) : null}
            {recorderVisible ? (
              <div ref={recorderPane} tabIndex={-1} className="cieo-comment-composer-pane" data-pane="recorder" data-phase={phase('recorder')} inert={leaving === 'recorder' || undefined} onAnimationEnd={leaving === 'recorder' ? onPaneEnd : undefined} {...customizePart(slotProps?.pane, "cieo-comment-composer-pane")}>
                {recorder ?? lastRecorder.current}
              </div>
            ) : null}
          </div>
          {attachments ? <div className="cieo-comment-composer-attachments" {...customizePart(slotProps?.attachments, "cieo-comment-composer-attachments")}>{attachments}</div> : null}
          <div className="cieo-comment-composer-bar" {...customizePart(slotProps?.bar, "cieo-comment-composer-bar")}>
            {tools ? (
              <div className="cieo-comment-composer-tools" role="group" aria-label="Add to your post" {...customizePart(slotProps?.tools, "cieo-comment-composer-tools")}>
                {tools}
              </div>
            ) : (
              <span />
            )}
            {composerShowsCount(length, maxLength) ? <CharacterCountRing length={length} max={maxLength as number} /> : null}
            <button type="submit" className="cieo-comment-composer-submit" disabled={!can} aria-busy={pending ? true : undefined} {...customizePart(slotProps?.submit, "cieo-comment-composer-submit")}>
              <SwapText value={pending ? 'Posting…' : submitLabel} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

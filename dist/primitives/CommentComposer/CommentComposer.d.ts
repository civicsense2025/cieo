import { type ReactNode } from 'react';
export interface CommentComposerProps {
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
    replyingTo?: {
        author: string;
        excerpt: string;
    };
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
export declare function composerLength(value: string): number;
/** Posting is allowed when not busy or disabled, within the limit, and there is text or an attachment. */
export declare function composerCanSubmit({ value, hasAttachments, maxLength, pending, disabled }: ComposerState): boolean;
/** The count ring appears once `threshold` (default 80%) of the limit is used. No limit, no ring. */
export declare function composerShowsCount(length: number, maxLength: number | undefined, threshold?: number): boolean;
/** Keyboard map for the text input: Cmd/Ctrl+Enter posts, Escape cancels a reply. Enter alone is a newline. Composition (IME) keystrokes never act. */
export declare function composerKeyAction(e: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    isComposing?: boolean;
}, replying: boolean): 'submit' | 'cancel-reply' | null;
export declare function CommentComposer({ value, onValueChange, onSubmit, placeholder, label, avatar, tools, attachments, hasAttachments, recorder, replyingTo, onCancelReply, maxLength, submitLabel, pending, disabled }: CommentComposerProps): import("react/jsx-runtime").JSX.Element;

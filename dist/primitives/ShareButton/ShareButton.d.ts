import type { PrimitivePartProps } from '../parts.js';
export type ShareMethod = 'native' | 'copy' | 'none';
export type ShareNavigator = {
    share?: unknown;
    clipboard?: {
        writeText?: unknown;
    };
};
export type ShareOutcome = 'native' | 'copy' | 'cancelled' | 'failed' | 'unavailable';
/** How a link can be shared here: the native sheet first, then the clipboard, otherwise not at all. */
export declare function shareMethod(nav: ShareNavigator | undefined): ShareMethod;
/** True only for absolute http and https URLs; anything else (javascript:, data:, relative paths) is never shared. */
export declare function isShareableUrl(url: string): boolean;
/** Shares through the best method. A user cancelling the native sheet is `cancelled`, not an error; any other native failure falls back to copying. */
export declare function runShare(nav: ShareNavigator | undefined, data: {
    url: string;
    title?: string;
    text?: string;
}): Promise<ShareOutcome>;
/** How long "Link copied" stays before the label returns, in milliseconds. */
export declare const SHARE_COPIED_MS = 2000;
export interface ShareButtonProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        button?: PrimitivePartProps;
        icon?: PrimitivePartProps;
    };
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
export declare function ShareButton({ className, slotProps, url, title, text, label, onShared }: ShareButtonProps): import("react/jsx-runtime").JSX.Element;

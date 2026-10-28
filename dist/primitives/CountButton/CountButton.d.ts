import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export type CountButtonTone = 'neutral' | 'accent' | 'danger' | 'success';
/** Accessible name that carries the exact count: "Like, 164 likes". A zero, missing or invalid count gives just the label. */
export declare function countButtonLabel(label: string, count?: number, unit?: string): string;
/** Scale the icon dips to on press before settling back to 1. */
export declare const COUNT_BUTTON_DIP = 0.8;
export interface CountButtonProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        icon?: PrimitivePartProps;
        glyph?: PrimitivePartProps;
        count?: PrimitivePartProps;
    };
    /** Icon shown when the action is off (or always, for plain actions). Decorative; the label names the button. */
    icon: ReactNode;
    /** Icon that fades in over `icon` while pressed (e.g. a filled heart). Optional. */
    activeIcon?: ReactNode;
    /** What the button does, as a verb: "Like", "Reply". Required; becomes the accessible name with the count. */
    label: string;
    /** Exact count. Zero or missing shows no number. */
    count?: number;
    /** Word read after the exact count: "likes", "replies". */
    countUnit?: string;
    /** Pressed state. When defined the button is a toggle (aria-pressed); when undefined it is a plain action. */
    pressed?: boolean;
    /** Called on every press. Toggles should flip `pressed` in the host. */
    onPress?: () => void;
    /** Color the pressed (or hovered) state takes. Defaults to neutral. */
    tone?: CountButtonTone;
    /** Control height. Defaults to md. */
    size?: 'sm' | 'md';
    /** Disables the button. */
    disabled?: boolean;
}
export declare function CountButton({ className, slotProps, icon, activeIcon, label, count, countUnit, pressed, onPress, tone, size, disabled }: CountButtonProps): import("react/jsx-runtime").JSX.Element;

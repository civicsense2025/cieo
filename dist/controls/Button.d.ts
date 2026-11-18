import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { type ButtonShape, type ButtonSize, type ButtonTone, type ButtonVariant } from './classes.js';
import { type ControlPartProps } from './parts.js';
export type ButtonState = 'idle' | 'pending' | 'done' | 'succeeded' | 'failed' | 'uncertain';
export type { ButtonTone, ButtonSize };
export interface ButtonSlotProps {
    root?: ControlPartProps;
    text?: ControlPartProps;
    pending?: ControlPartProps;
    done?: ControlPartProps;
    failed?: ControlPartProps;
    uncertain?: ControlPartProps;
}
interface ButtonOwnProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Semantic tone for destructive, confirmation, or caution actions. */
    tone?: ButtonTone;
    /** Pill (fully rounded) shape for compact product bars. Defaults to rect. */
    shape?: ButtonShape;
    block?: boolean;
    /** Polymorphic child rendering: merges button classes, ARIA, ref, and handlers onto the single child element. */
    asChild?: boolean;
    /** Leading icon, or the whole content of an icon-only button. */
    icon?: ReactNode;
    /** Opt into the morph: idle, pending, done/succeeded, failed, or uncertain. */
    state?: ButtonState;
    /** Announced while pending. */
    pendingLabel?: string;
    /** Shown next to the check and announced when done/succeeded. */
    doneLabel?: string;
    /** Shown next to the alert icon and announced when failed. */
    failedLabel?: string;
    /** Shown next to the alert icon and announced when uncertain. */
    uncertainLabel?: string;
    slotProps?: ButtonSlotProps;
}
type Base = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & ButtonOwnProps;
/** A text button has children; an icon-only button has an icon and must have an aria-label. */
export type ButtonProps = Base & ({
    children: ReactNode;
} | {
    children?: undefined;
    icon: ReactNode;
    'aria-label': string;
});
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;

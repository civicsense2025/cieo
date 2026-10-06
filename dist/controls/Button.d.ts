import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { type ButtonVariant, type ControlSize } from './classes.js';
export type ButtonState = 'idle' | 'pending' | 'done';
interface ButtonOwnProps {
    variant?: ButtonVariant;
    size?: ControlSize;
    block?: boolean;
    /** Leading icon, or the whole content of an icon-only button. */
    icon?: ReactNode;
    /** Opt into the morph: idle shows the label, pending a spinner, done a check. */
    state?: ButtonState;
    /** Announced while pending. */
    pendingLabel?: string;
    /** Shown next to the check and announced when done. Without it only the check shows and "Done" is announced. */
    doneLabel?: string;
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
export {};

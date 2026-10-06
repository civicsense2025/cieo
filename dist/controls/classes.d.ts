export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text';
export type ControlSize = 'sm' | 'md';
export interface ButtonClassOptions {
    variant?: ButtonVariant;
    size?: ControlSize;
    /** Square, icon-only shape. The element must carry an aria-label. */
    iconOnly?: boolean;
    /** Fills the width of its container. */
    block?: boolean;
    className?: string;
}
/** Joins truthy class names. */
export declare const cx: (...names: Array<string | false | null | undefined>) => string;
export declare function buttonClassName(o?: ButtonClassOptions): string;

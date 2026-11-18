export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text';
export type ControlSize = 'sm' | 'md';
export type ButtonSize = ControlSize | 'lg';
export type ButtonShape = 'rect' | 'pill';
export type ButtonTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning';
export interface ButtonClassOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Semantic tone override. Defaults to neutral. */
    tone?: ButtonTone;
    /** Pill (fully rounded) shape for compact product bars. Defaults to rect. */
    shape?: ButtonShape;
    /** Square, icon-only shape. The element must carry an aria-label. */
    iconOnly?: boolean;
    /** Fills the width of its container. */
    block?: boolean;
    className?: string;
}
/** Joins truthy class names. */
export declare const cx: (...names: Array<string | false | null | undefined>) => string;
export declare function buttonClassName(o?: ButtonClassOptions): string;

/* Class helpers with no React and no 'use client', so a server component can style an <a> or <Link> as a button. */

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
export const cx = (...names: Array<string | false | null | undefined>): string => names.filter(Boolean).join(' ');

export function buttonClassName(o: ButtonClassOptions = {}): string {
  return cx(
    'cieo-ctl',
    'cieo-btn',
    `cieo-btn--${o.variant ?? 'secondary'}`,
    `cieo-btn--${o.size ?? 'md'}`,
    o.iconOnly && 'cieo-btn--icon',
    o.block && 'cieo-btn--block',
    o.className,
  );
}

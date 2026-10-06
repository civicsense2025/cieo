/* Class helpers with no React and no 'use client', so a server component can style an <a> or <Link> as a button. */
/** Joins truthy class names. */
export const cx = (...names) => names.filter(Boolean).join(' ');
export function buttonClassName(o = {}) {
    return cx('cieo-ctl', 'cieo-btn', `cieo-btn--${o.variant ?? 'secondary'}`, `cieo-btn--${o.size ?? 'md'}`, o.iconOnly && 'cieo-btn--icon', o.block && 'cieo-btn--block', o.className);
}

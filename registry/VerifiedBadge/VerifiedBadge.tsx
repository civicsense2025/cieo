// src/primitives/VerifiedBadge/VerifiedBadge.tsx
'use client';
/* VerifiedBadge. A small seal with a check that marks an account as verified. The host decides who is verified; this only draws it. */
export type VerifiedBadgeSize = 'sm' | 'md';

/** Pixel-free size lookup: the CSS reads the data-size attribute, this keeps unknown input on the default. */
export function verifiedBadgeSize(size: unknown): VerifiedBadgeSize {
  return size === 'sm' ? 'sm' : 'md';
}

export interface VerifiedBadgeProps {
  /** Accessible name read by screen readers. Defaults to Verified. */
  label?: string;
  /** sm sits inline with caption text, md with body text. Defaults to md. */
  size?: VerifiedBadgeSize;
}

export function VerifiedBadge({ label = 'Verified', size }: VerifiedBadgeProps) {
  return (
    <svg className="cieo cieo-verified-badge" data-size={verifiedBadgeSize(size)} role="img" aria-label={label} viewBox="0 0 24 24" focusable="false">
      <title>{label}</title>
      <path className="cieo-verified-badge-seal" d="M12 1.8l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.2l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z" />
      <path className="cieo-verified-badge-check" d="M7.8 12.3l2.9 2.9 5.6-5.8" fill="none" />
    </svg>
  );
}

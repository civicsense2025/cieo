// src/primitives/IndexRow/IndexRow.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* IndexRow. Twin of CieoUI IndexRow. */
export interface IndexRowProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  rank: number;
  title: string;
  note?: string;
  /** 0 to 1; the row's figure drawn as a bar. */
  fraction?: number;
  href?: string;
}
/** Two digits: 1 becomes "01". */
export function rankLabel(rank: number): string { return String(Math.max(1, Math.floor(Number.isFinite(rank) ? rank : 1))).padStart(2, '0'); }
/** A bar fraction clamped to 0..1, or null when it is not a number. */
export function barFraction(value?: number): number | null { return value === undefined || !Number.isFinite(value) ? null : Math.min(1, Math.max(0, value)); }
export function IndexRow({ className, slotProps, rank, title, note, fraction, href }: IndexRowProps) {
  const f = barFraction(fraction);
  const body = (<><span className="cieo-p-index-row__rank" aria-hidden="true">{rankLabel(rank)}</span><span className="cieo-p-index-row__text"><b>{title}</b>{note ? <span>{note}</span> : null}{f === null ? null : <i style={{ inlineSize: `${f * 100}%` }} />}</span></>);
  return href ? <a {...customizePart(slotProps?.root, "cieo cieo-p-index-row", undefined, className)} href={href}>{body}</a> : <div {...customizePart(slotProps?.root, "cieo cieo-p-index-row", undefined, className)}>{body}</div>;
}

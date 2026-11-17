// src/primitives/RollCall/RollCall.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { PersonRow } from '../PersonRow/PersonRow.js';
/* RollCall. Twin of CieoUI RollCall. Empty groups are left out. */
export interface RollCallMember { id: string; name: string; detail?: string; src?: string }
export interface RollCallGroup { id: string; title: string; color: string; members: RollCallMember[] }
export interface RollCallProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  groups: RollCallGroup[];
  /** 1 to 4 columns; out-of-range values clamp. */
  columns?: number;
}
export function rollColumns(n: number): number { return Math.min(4, Math.max(1, Math.floor(Number.isFinite(n) ? n : 3))); }
export function RollCall({ className, slotProps, groups, columns = 3 }: RollCallProps) {
  return (
    <div {...customizePart(slotProps?.root, "cieo cieo-p-roll-call", undefined, className)} style={{ columnCount: rollColumns(columns) }}>
      {groups.filter((g) => g.members.length > 0).map((g) => (
        <section key={g.id} style={{ ['--cieo-roll' as string]: g.color }}>
          <h3><i aria-hidden="true" />{g.title} <span>{g.members.length}</span></h3>
          <ul>{g.members.map((m) => <li key={m.id}><PersonRow compact grayscale name={m.name} detail={m.detail} src={m.src} ring={g.color} /></li>)}</ul>
        </section>
      ))}
    </div>
  );
}

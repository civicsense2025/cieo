// src/primitives/AgentIcon/AgentIcon.tsx
'use client';
/* AgentIcon. One agent action or state icon at rest, drawn from cieo/agent-icons data in currentColor. Status
   icons take their tone colour from tokens. Decorative unless labelled. */
import type { ReactNode } from 'react';
import {
  AGENT_ICON_VIEWBOX,
  agentIconGlyph,
  agentIconOutline,
  agentIconStrokeWidth,
  getAgentIcon,
  roundIconUnit,
  type AgentIconDefinition,
  type AgentIconId,
  type IconNode,
} from '../../agent/icons.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface AgentIconProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Icon id (e.g. "browsing") or a definition from AGENT_ICONS. */
  icon: AgentIconId | AgentIconDefinition;
  /** Rendered size in pixels. Picks the glyph detail and stroke weight. Defaults to 24. */
  size?: number;
  /** Accessible name. Omit when visible text beside the icon names it. */
  label?: string;
  /** Draw the agent's square outline. Defaults to true. */
  outline?: boolean;
}

const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function draw(nodes: readonly IconNode[], prefix: string): ReactNode[] {
  return nodes.map(([tag, attrs, kids], i) => {
    const props: Record<string, string> = {};
    for (const key in attrs) props[camel(key)] = attrs[key];
    const Tag = tag;
    return <Tag key={`${prefix}${i}`} {...props}>{kids ? draw(kids, `${prefix}${i}.`) : null}</Tag>;
  });
}

export function AgentIcon({ className, slotProps, icon, size = 24, label, outline = true }: AgentIconProps) {
  const def = typeof icon === 'string' ? getAgentIcon(icon) : icon;
  if (!def) return null;
  const stroke = agentIconStrokeWidth(size);
  const sw = roundIconUnit(stroke);
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const, focusable: 'false' as const };
  return (
    <svg className="cieo cieo-p-agent-icon" viewBox={AGENT_ICON_VIEWBOX} width={size} height={size} data-icon={def.id} data-tone={def.tone ?? undefined} {...a11y} {...customizePart(slotProps?.root, "cieo cieo-p-agent-icon", undefined, className)}>
      {outline ? <rect {...agentIconOutline(stroke)} fill="none" stroke="currentColor" strokeWidth={sw} /> : null}
      <g fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {draw(agentIconGlyph(def, size), '')}
      </g>
    </svg>
  );
}

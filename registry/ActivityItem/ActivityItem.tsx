// src/primitives/ActivityItem/ActivityItem.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ActivityItem. One notification or activity row: who did what, a quoted snippet, when. The host owns data, read state and navigation. */
import type { ReactNode } from 'react';

export type ActivityTone = 'neutral' | 'accent' | 'danger' | 'success';

/** Which element carries the row's main action: a link, a button, or nothing when the row is informational. */
export function activityMainTag(href: string | undefined, onSelect: (() => void) | undefined): 'a' | 'button' | 'div' {
  if (href) return 'a';
  if (onSelect) return 'button';
  return 'div';
}

export interface ActivityItemProps {
  className?: string;
  slotProps?: { line?: PrimitivePartProps; actor?: PrimitivePartProps; what?: PrimitivePartProps; preview?: PrimitivePartProps; root?: PrimitivePartProps; lead?: PrimitivePartProps; avatar?: PrimitivePartProps; badge?: PrimitivePartProps; main?: PrimitivePartProps; dot?: PrimitivePartProps; actions?: PrimitivePartProps };

  /** Who did it: name in bold plus an avatar node (e.g. an Avatar). */
  actor: { name: string; avatar: ReactNode };
  /** Small badge on the avatar corner naming the kind of event (heart, reply arrow). Decorative. */
  icon?: ReactNode;
  /** Colors the icon badge. Defaults to neutral. */
  tone?: ActivityTone;
  /** What happened, after the actor name: "liked your reply". */
  children: ReactNode;
  /** Quoted snippet of the thing acted on. */
  preview?: string;
  /** Human time text such as "2h". */
  time?: string;
  /** Machine time for the <time> element (ISO 8601). */
  dateTime?: string;
  /** Unread rows get a dot and stronger text; flipping to false fades the dot out. */
  unread?: boolean;
  /** Makes the whole row a link. */
  href?: string;
  /** Makes the whole row a button when there is no href. */
  onSelect?: () => void;
  /** Controls such as Follow back. They stay separately focusable above the stretched row action. */
  actions?: ReactNode;
}

export function ActivityItem({ className, slotProps, actor, icon, tone = 'neutral', children, preview, time, dateTime, unread = false, href, onSelect, actions }: ActivityItemProps) {
  const Main = activityMainTag(href, onSelect);
  const text = (
    <>
      <span className="cieo-activity-item-line" {...customizePart(slotProps?.line, "cieo-activity-item-line")}>
        <strong className="cieo-activity-item-actor" {...customizePart(slotProps?.actor, "cieo-activity-item-actor")}>{actor.name}</strong> <span className="cieo-activity-item-what" {...customizePart(slotProps?.what, "cieo-activity-item-what")}>{children}</span>
        {time ? <> <ActivityTime time={time} dateTime={dateTime} /></> : null}
      </span>
      {preview ? <span className="cieo-activity-item-preview" {...customizePart(slotProps?.preview, "cieo-activity-item-preview")}>{preview}</span> : null}
      {unread ? <span className="cieo-sr-only">, unread</span> : null}
    </>
  );
  return (
    <div data-unread={unread ? 'true' : undefined} data-tone={tone} data-interactive={Main === 'div' ? undefined : 'true'} className="cieo cieo-activity-item" {...customizePart(slotProps?.root, "cieo cieo-activity-item", undefined, className)}>
      <span className="cieo-activity-item-lead" {...customizePart(slotProps?.lead, "cieo-activity-item-lead")}>
        <span className="cieo-activity-item-avatar" {...customizePart(slotProps?.avatar, "cieo-activity-item-avatar")}>{actor.avatar}</span>
        {icon ? <span aria-hidden="true" className="cieo-activity-item-badge" {...customizePart(slotProps?.badge, "cieo-activity-item-badge")}>{icon}</span> : null}
      </span>
      {Main === 'a' ? (
        <a href={href} onClick={onSelect} className="cieo-activity-item-main" {...customizePart(slotProps?.main, "cieo-activity-item-main")}>{text}</a>
      ) : Main === 'button' ? (
        <button type="button" onClick={onSelect} className="cieo-activity-item-main" {...customizePart(slotProps?.main, "cieo-activity-item-main")}>{text}</button>
      ) : (
        <div className="cieo-activity-item-main" {...customizePart(slotProps?.main, "cieo-activity-item-main")}>{text}</div>
      )}
      <span aria-hidden="true" className="cieo-activity-item-dot" {...customizePart(slotProps?.dot, "cieo-activity-item-dot")} />
      {actions ? <span className="cieo-activity-item-actions" {...customizePart(slotProps?.actions, "cieo-activity-item-actions")}>{actions}</span> : null}
    </div>
  );
}

function ActivityTime({ time, dateTime }: { time: string; dateTime?: string }) {
  return <time dateTime={dateTime} className="cieo-activity-item-time">{time}</time>;
}

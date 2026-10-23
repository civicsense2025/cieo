// src/primitives/DeliveryStatus/DeliveryStatus.tsx
'use client';
/* DeliveryStatus. Where one sent message is on its way: a small icon that changes shape as it progresses, plus a spoken word. The host owns the status and the time. */

export type DeliveryState = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/** Word for a delivery state, read aloud and shown for failures. */
export function deliveryLabel(status: DeliveryState): string {
  if (status === 'sending') return 'Sending';
  if (status === 'sent') return 'Sent';
  if (status === 'delivered') return 'Delivered';
  if (status === 'read') return 'Read';
  return 'Not delivered';
}

export interface DeliveryStatusProps {
  /** Where the message is. Required. */
  status: DeliveryState;
  /** Optional time text shown beside the icon (for example "9:41 AM"). Read after the status. */
  time?: string;
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function DeliveryStatus({ status, time }: DeliveryStatusProps) {
  const label = deliveryLabel(status);
  const failed = status === 'failed';
  return (
    <span role={failed ? 'alert' : undefined} data-status={status} className="cieo cieo-delivery-status">
      <span aria-hidden="true" className="cieo-delivery-status-icon">
        <svg viewBox="0 0 20 16" width="20" height="16" focusable="false">
          <g className="cieo-delivery-status-glyph" data-glyph="sending" {...stroke}>
            <circle cx="10" cy="8" r="5.5" />
            <path d="M10 5v3.2l2 1.3" />
          </g>
          <g className="cieo-delivery-status-glyph" data-glyph="sent" {...stroke}>
            <path d="M6.5 8.5l2.6 2.6L14 5.5" />
          </g>
          <g className="cieo-delivery-status-glyph" data-glyph="double" {...stroke}>
            <path d="M3.5 8.5l2.6 2.6L11 5.5" />
            <path d="M9.5 10.9l.5.2L16 5.5" />
          </g>
          <g className="cieo-delivery-status-glyph" data-glyph="failed" {...stroke}>
            <path d="M10 4.5v4.4" />
            <path d="M10 11.6v.1" />
          </g>
        </svg>
      </span>
      {failed ? <span aria-hidden="true" className="cieo-delivery-status-text">{label}</span> : null}
      {time ? (
        <span aria-hidden="true" className="cieo-delivery-status-time">
          {time}
        </span>
      ) : null}
      <span className="cieo-sr-only">{time ? `${label}, ${time}` : label}</span>
    </span>
  );
}

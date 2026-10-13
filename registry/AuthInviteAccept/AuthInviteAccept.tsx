'use client';
/* AuthInviteAccept (static). Org invite card: who invited whom to what, with accept and decline. */
import type { CSSProperties } from 'react';

export interface AuthInviteAcceptProps {
  id: string;
  orgName: string;
  inviterName: string;
  role: string;
  pending?: boolean;
  error?: string;
  style?: CSSProperties;
  onAccept: () => void;
  onDecline: () => void;
}

export function AuthInviteAccept({ id, orgName, inviterName, role, pending, error, style, onAccept, onDecline }: AuthInviteAcceptProps) {
  return (
    <section className="cieo cieo-auth-invite-accept" aria-labelledby={`${id}-title`} style={style}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`}>You&apos;re invited</h2>
      <p className="cieo-auth-invite-text">
        {inviterName} invited you to join {orgName} as {role}.
      </p>
      {error ? <span className="cieo-auth-error" role="alert">{error}</span> : null}
      <div className="cieo-auth-invite-actions">
        <button type="button" className="cieo-auth-accept" disabled={pending} onClick={onAccept}>
          {pending ? 'Accepting…' : `Accept invite to ${orgName}`}
        </button>
        <button type="button" className="cieo-auth-decline" disabled={pending} onClick={onDecline}>
          {`Decline invite to ${orgName}`}
        </button>
      </div>
    </section>
  );
}

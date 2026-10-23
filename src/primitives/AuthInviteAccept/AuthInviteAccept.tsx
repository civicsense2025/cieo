'use client';
/* AuthInviteAccept. Org invite card with smooth, truthful pending and error feedback. */
import type { CSSProperties } from 'react';
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';

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
      <AuthMotionMessage className="cieo-auth-error" role="alert" value={error} />
      <div className="cieo-auth-invite-actions">
        <button type="button" className="cieo-auth-accept" disabled={pending} onClick={onAccept}>
          <AuthSwapText value={pending ? 'Accepting…' : `Accept invite to ${orgName}`} />
        </button>
        <button type="button" className="cieo-auth-decline" disabled={pending} onClick={onDecline}>
          {`Decline invite to ${orgName}`}
        </button>
      </div>
    </section>
  );
}

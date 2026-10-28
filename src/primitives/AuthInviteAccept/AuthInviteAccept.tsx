'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* AuthInviteAccept. Org invite card with smooth, truthful pending and error feedback. */
import type { CSSProperties } from 'react';
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';

export interface AuthInviteAcceptProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; cardTitle?: PrimitivePartProps; inviteText?: PrimitivePartProps; inviteActions?: PrimitivePartProps; accept?: PrimitivePartProps; decline?: PrimitivePartProps };

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

export function AuthInviteAccept({ className, slotProps, id, orgName, inviterName, role, pending, error, style, onAccept, onDecline }: AuthInviteAcceptProps) {
  return (
    <section className="cieo cieo-auth-invite-accept" aria-labelledby={`${id}-title`} style={style} {...customizePart(slotProps?.root, "cieo cieo-auth-invite-accept", style, className)}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`} {...customizePart(slotProps?.cardTitle, "cieo-auth-card-title")}>You&apos;re invited</h2>
      <p className="cieo-auth-invite-text" {...customizePart(slotProps?.inviteText, "cieo-auth-invite-text")}>
        {inviterName} invited you to join {orgName} as {role}.
      </p>
      <AuthMotionMessage className="cieo-auth-error" role="alert" value={error} />
      <div className="cieo-auth-invite-actions" {...customizePart(slotProps?.inviteActions, "cieo-auth-invite-actions")}>
        <button type="button" className="cieo-auth-accept" disabled={pending} onClick={onAccept} {...customizePart(slotProps?.accept, "cieo-auth-accept")}>
          <AuthSwapText value={pending ? 'Accepting…' : `Accept invite to ${orgName}`} />
        </button>
        <button type="button" className="cieo-auth-decline" disabled={pending} onClick={onDecline} {...customizePart(slotProps?.decline, "cieo-auth-decline")}>
          {`Decline invite to ${orgName}`}
        </button>
      </div>
    </section>
  );
}

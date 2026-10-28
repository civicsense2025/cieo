'use client';
/* AuthAccountCard. Profile row with a spring-sized inline confirmation step guarding bulk sign-out. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AuthMotionFrame, AuthMotionMessage } from '../AuthSignInCard/AuthMotion.js';

export interface AuthAccountCardProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; title?: PrimitivePartProps; profile?: PrimitivePartProps; avatar?: PrimitivePartProps; identity?: PrimitivePartProps; name?: PrimitivePartProps; email?: PrimitivePartProps; confirmation?: PrimitivePartProps; actions?: PrimitivePartProps; confirm?: PrimitivePartProps; cancel?: PrimitivePartProps; signOut?: PrimitivePartProps };
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  signOutConfirm?: boolean;
  style?: CSSProperties;
  onSignOut: () => void;
}

export function AuthAccountCard({ id, name, email, avatarInitials, signOutConfirm, style, onSignOut, className, slotProps }: AuthAccountCardProps) {
  const [confirming, setConfirming] = useState(false);
  const start = () => {
    if (signOutConfirm) setConfirming(true);
    else onSignOut();
  };
  const confirm = () => { setConfirming(false); onSignOut(); };
  return (
    <section className="cieo cieo-auth-account-card" aria-labelledby={`${id}-title`} style={style} {...customizePart(slotProps?.root, "cieo cieo-auth-account-card", style, className)}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`} {...customizePart(slotProps?.title, "cieo-auth-card-title", undefined)}>Account</h2>
      <p className="cieo-auth-profile" {...customizePart(slotProps?.profile, "cieo-auth-profile", undefined)}>
        <span className="cieo-auth-avatar" aria-hidden="true" {...customizePart(slotProps?.avatar, "cieo-auth-avatar", undefined)}>{avatarInitials}</span>
        <span className="cieo-auth-identity" {...customizePart(slotProps?.identity, "cieo-auth-identity", undefined)}>
          <span className="cieo-auth-name" {...customizePart(slotProps?.name, "cieo-auth-name", undefined)}>{name}</span>
          <span className="cieo-auth-email" {...customizePart(slotProps?.email, "cieo-auth-email", undefined)}>{email}</span>
        </span>
      </p>
      <AuthMotionFrame value={confirming ? 'confirm' : 'signout'}>
        {(shown, live) => shown === 'confirm' ? (
        <div className="cieo-auth-signout-confirm" {...customizePart(slotProps?.confirmation, "cieo-auth-signout-confirm", undefined)}>
          <AuthMotionMessage className="cieo-auth-status" role="status" value={live ? 'Sign out of all devices?' : undefined} />
          <div className="cieo-auth-invite-actions" {...customizePart(slotProps?.actions, "cieo-auth-invite-actions", undefined)}>
            <button type="button" className="cieo-auth-accept" disabled={!live} onClick={confirm} {...customizePart(slotProps?.confirm, "cieo-auth-accept", undefined)}>Confirm sign out</button>
            <button type="button" className="cieo-auth-decline" disabled={!live} onClick={() => setConfirming(false)} {...customizePart(slotProps?.cancel, "cieo-auth-decline", undefined)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="cieo-auth-signout" disabled={!live} onClick={start} {...customizePart(slotProps?.signOut, "cieo-auth-signout", undefined)}>Sign out</button>
      )}
      </AuthMotionFrame>
    </section>
  );
}

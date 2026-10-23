'use client';
/* AuthAccountCard. Profile row with a spring-sized inline confirmation step guarding bulk sign-out. */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AuthMotionFrame, AuthMotionMessage } from '../AuthSignInCard/AuthMotion.js';

export interface AuthAccountCardProps {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  signOutConfirm?: boolean;
  style?: CSSProperties;
  onSignOut: () => void;
}

export function AuthAccountCard({ id, name, email, avatarInitials, signOutConfirm, style, onSignOut }: AuthAccountCardProps) {
  const [confirming, setConfirming] = useState(false);
  const start = () => {
    if (signOutConfirm) setConfirming(true);
    else onSignOut();
  };
  const confirm = () => { setConfirming(false); onSignOut(); };
  return (
    <section className="cieo cieo-auth-account-card" aria-labelledby={`${id}-title`} style={style}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`}>Account</h2>
      <p className="cieo-auth-profile">
        <span className="cieo-auth-avatar" aria-hidden="true">{avatarInitials}</span>
        <span className="cieo-auth-identity">
          <span className="cieo-auth-name">{name}</span>
          <span className="cieo-auth-email">{email}</span>
        </span>
      </p>
      <AuthMotionFrame value={confirming ? 'confirm' : 'signout'}>
        {(shown, live) => shown === 'confirm' ? (
        <div className="cieo-auth-signout-confirm">
          <AuthMotionMessage className="cieo-auth-status" role="status" value={live ? 'Sign out of all devices?' : undefined} />
          <div className="cieo-auth-invite-actions">
            <button type="button" className="cieo-auth-accept" disabled={!live} onClick={confirm}>Confirm sign out</button>
            <button type="button" className="cieo-auth-decline" disabled={!live} onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="cieo-auth-signout" disabled={!live} onClick={start}>Sign out</button>
      )}
      </AuthMotionFrame>
    </section>
  );
}

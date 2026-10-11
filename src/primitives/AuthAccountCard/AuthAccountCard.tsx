'use client';
/* AuthAccountCard (static). Profile row with sign out; an inline confirm step guards bulk sign-out. */
import { useState } from 'react';
import type { CSSProperties } from 'react';

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
      {confirming ? (
        <div className="cieo-auth-signout-confirm">
          <p className="cieo-auth-status" role="status">Sign out of all devices?</p>
          <div className="cieo-auth-invite-actions">
            <button type="button" className="cieo-auth-accept" onClick={confirm}>Confirm sign out</button>
            <button type="button" className="cieo-auth-decline" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="cieo-auth-signout" onClick={start}>Sign out</button>
      )}
    </section>
  );
}

'use client';
/* AuthMfaChallenge (static). OTP plus verify, with a recovery-code fallback toggle. */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AuthOtpInput } from '../AuthOtpInput/AuthOtpInput';

export interface AuthMfaChallengeProps {
  id: string;
  pending?: boolean;
  error?: string;
  style?: CSSProperties;
  onSubmit: (code: string) => void;
  onRecovery: (code: string) => void;
}

export function AuthMfaChallenge({ id, pending, error, style, onSubmit, onRecovery }: AuthMfaChallengeProps) {
  const [useRecovery, setUseRecovery] = useState(false);
  const [recovery, setRecovery] = useState('');
  return (
    <div className="cieo cieo-auth-mfa-challenge" style={style}>
      {useRecovery ? (
        <span className="cieo-auth-recovery">
          <label className="cieo-auth-label" htmlFor={`${id}-recovery`}>Recovery code</label>
          <input
            id={`${id}-recovery`}
            className="cieo-auth-input"
            autoComplete="off"
            value={recovery}
            disabled={pending}
            onChange={e => setRecovery(e.target.value)}
          />
          <button type="button" className="cieo-auth-submit" disabled={pending || !recovery} onClick={() => onRecovery(recovery)}>
            {pending ? 'Checking…' : 'Use recovery code'}
          </button>
        </span>
      ) : (
        <AuthOtpInput id={`${id}-otp`} onComplete={onSubmit} />
      )}
      {error ? <span className="cieo-auth-error" role="alert">{error}</span> : null}
      <button type="button" className="cieo-auth-toggle" onClick={() => setUseRecovery(v => !v)}>
        {useRecovery ? 'Use the authenticator instead' : 'Use a recovery code instead'}
      </button>
    </div>
  );
}

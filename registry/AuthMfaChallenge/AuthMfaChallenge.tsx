'use client';
/* AuthMfaChallenge. OTP and recovery panes share a measured spring-sized frame. */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AuthOtpInput } from '../AuthOtpInput/AuthOtpInput.js';
import { AuthMotionFrame, AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';

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
  const pane = useRecovery ? 'recovery' : 'otp';
  return (
    <div className="cieo cieo-auth-mfa-challenge" style={style}>
      <AuthMotionFrame value={pane}>
        {(shown, live) => shown === 'recovery' ? (
          <span className="cieo-auth-recovery">
            <label className="cieo-auth-label" htmlFor={`${id}-recovery`}>Recovery code</label>
            <input
              id={`${id}-recovery`}
              className="cieo-auth-input"
              autoComplete="off"
              value={recovery}
              disabled={pending || !live}
              aria-invalid={error ? 'true' : undefined}
              onChange={e => setRecovery(e.target.value)}
            />
            <button type="button" className="cieo-auth-submit" disabled={pending || !recovery || !live} onClick={() => onRecovery(recovery.toLowerCase().replace(/[\s-]/g, ''))}>
              <AuthSwapText value={pending ? 'Checking…' : 'Use recovery code'} />
            </button>
            <AuthMotionMessage className="cieo-auth-error" role="alert" value={live ? error : undefined} />
          </span>
        ) : (
          <AuthOtpInput id={`${id}-otp`} disabled={pending || !live} error={live ? error : undefined} onComplete={live ? onSubmit : undefined} />
        )}
      </AuthMotionFrame>
      <button type="button" className="cieo-auth-toggle" disabled={pending} onClick={() => setUseRecovery(v => !v)}>
        <AuthSwapText value={useRecovery ? 'Use the authenticator instead' : 'Use a recovery code instead'} />
      </button>
    </div>
  );
}

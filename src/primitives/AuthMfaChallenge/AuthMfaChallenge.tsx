'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* AuthMfaChallenge. OTP and recovery panes share a measured spring-sized frame. */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AuthOtpInput } from '../AuthOtpInput/AuthOtpInput.js';
import { AuthMotionFrame, AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';

export interface AuthMfaChallengeProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; recovery?: PrimitivePartProps; label?: PrimitivePartProps; input?: PrimitivePartProps; submit?: PrimitivePartProps; toggle?: PrimitivePartProps };

  id: string;
  pending?: boolean;
  error?: string;
  style?: CSSProperties;
  onSubmit: (code: string) => void;
  onRecovery: (code: string) => void;
}

export function AuthMfaChallenge({ className, slotProps, id, pending, error, style, onSubmit, onRecovery }: AuthMfaChallengeProps) {
  const [useRecovery, setUseRecovery] = useState(false);
  const [recovery, setRecovery] = useState('');
  const pane = useRecovery ? 'recovery' : 'otp';
  return (
    <div className="cieo cieo-auth-mfa-challenge" style={style} {...customizePart(slotProps?.root, "cieo cieo-auth-mfa-challenge", style, className)}>
      <AuthMotionFrame value={pane}>
        {(shown, live) => shown === 'recovery' ? (
          <span className="cieo-auth-recovery" {...customizePart(slotProps?.recovery, "cieo-auth-recovery")}>
            <label className="cieo-auth-label" htmlFor={`${id}-recovery`} {...customizePart(slotProps?.label, "cieo-auth-label")}>Recovery code</label>
            <input
              id={`${id}-recovery`}
              className="cieo-auth-input"
              autoComplete="off"
              value={recovery}
              disabled={pending || !live}
              aria-invalid={error ? 'true' : undefined}
              onChange={e => setRecovery(e.target.value)} {...customizePart(slotProps?.input, "cieo-auth-input")}
            />
            <button type="button" className="cieo-auth-submit" disabled={pending || !recovery || !live} onClick={() => onRecovery(recovery.toLowerCase().replace(/[\s-]/g, ''))} {...customizePart(slotProps?.submit, "cieo-auth-submit")}>
              <AuthSwapText value={pending ? 'Checking…' : 'Use recovery code'} />
            </button>
            <AuthMotionMessage className="cieo-auth-error" role="alert" value={live ? error : undefined} />
          </span>
        ) : (
          <AuthOtpInput id={`${id}-otp`} disabled={pending || !live} error={live ? error : undefined} onComplete={live ? onSubmit : undefined} />
        )}
      </AuthMotionFrame>
      <button type="button" className="cieo-auth-toggle" disabled={pending} onClick={() => setUseRecovery(v => !v)} {...customizePart(slotProps?.toggle, "cieo-auth-toggle")}>
        <AuthSwapText value={useRecovery ? 'Use the authenticator instead' : 'Use a recovery code instead'} />
      </button>
    </div>
  );
}

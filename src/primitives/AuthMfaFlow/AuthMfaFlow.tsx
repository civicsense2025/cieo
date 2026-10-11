'use client';
/* AuthMfaFlow (static). MFA card with challenge, resend, and status. */
import type { CSSProperties } from 'react';
import { AuthCardShell } from '../AuthSignInCard/AuthSignInCard';
import { AuthMfaChallenge } from '../AuthMfaChallenge/AuthMfaChallenge';

export interface AuthMfaFlowProps {
  id: string;
  title?: string;
  pending?: boolean;
  error?: string;
  status?: string;
  resendIn?: number;
  style?: CSSProperties;
  onSubmit: (code: string) => void;
  onRecovery: (code: string) => void;
  onResend?: () => void;
}

export function AuthMfaFlow({ id, title = 'Check your authenticator', pending, error, status, resendIn = 0, style, onSubmit, onRecovery, onResend }: AuthMfaFlowProps) {
  return (
    <AuthCardShell id={id} title={title} status={status} style={style}>
      <AuthMfaChallenge id={`${id}-challenge`} pending={pending} error={error} onSubmit={onSubmit} onRecovery={onRecovery} />
      {onResend ? (
        <button type="button" className="cieo-auth-toggle" disabled={resendIn > 0} onClick={onResend}>
          {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
        </button>
      ) : null}
    </AuthCardShell>
  );
}

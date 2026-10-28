'use client';
/* AuthMfaFlow. MFA card with challenge, smoothly swapping resend copy, and status. */
import type { CSSProperties } from 'react';
import { AuthCardShell, type AuthCardSlotProps, type AuthCardSlots } from '../AuthSignInCard/AuthSignInCard.js';
import { AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
import { AuthMfaChallenge } from '../AuthMfaChallenge/AuthMfaChallenge.js';

export interface AuthMfaFlowProps {
  className?: string;
  slotProps?: AuthCardSlotProps;
  slots?: AuthCardSlots;
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

export function AuthMfaFlow({ id, title = 'Check your authenticator', pending, error, status, resendIn = 0, style, onSubmit, onRecovery, onResend, className, slotProps, slots }: AuthMfaFlowProps) {
  return (
    <AuthCardShell className={className} slotProps={slotProps} slots={slots} id={id} title={title} status={status} style={style}>
      <AuthMfaChallenge id={`${id}-challenge`} pending={pending} error={error} onSubmit={onSubmit} onRecovery={onRecovery} />
      {onResend ? (
        <button type="button" className="cieo-auth-toggle" disabled={resendIn > 0} onClick={onResend}>
          <AuthSwapText value={resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'} />
        </button>
      ) : null}
    </AuthCardShell>
  );
}

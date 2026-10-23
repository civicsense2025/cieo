'use client';
/* AuthPasskeyButton. Passkey ceremony button with smooth pending copy and fallback presence. */
import type { CSSProperties } from 'react';
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';

export interface AuthPasskeyButtonProps {
  id: string;
  /** Button label. Defaults to "Continue with a passkey". */
  label?: string;
  /** Ceremony in flight: label swaps to waiting text and the button busies. */
  pending?: boolean;
  disabled?: boolean;
  /** False on devices without WebAuthn: shows the fallback note. Defaults to true. */
  supported?: boolean;
  style?: CSSProperties;
  onPress?: () => void;
}

export function AuthPasskeyButton({ id, label = 'Continue with a passkey', pending, disabled, supported = true, style, onPress }: AuthPasskeyButtonProps) {
  const busy = pending || disabled;
  return (
    <span className="cieo cieo-auth-passkey-button" style={style}>
      <button
        type="button"
        id={id}
        className="cieo-auth-submit"
        disabled={busy}
        aria-busy={pending || undefined}
        onClick={() => { if (!busy) onPress?.(); }}
      >
        <AuthSwapText value={pending ? 'Waiting for your passkey…' : label} />
      </button>
      <AuthMotionMessage id={`${id}-fallback`} className="cieo-auth-note" value={supported ? undefined : 'This device can’t use passkeys. Use your password or a code instead.'} />
    </span>
  );
}

'use client';
/* AuthPasskeyButton (static). Button starting a passkey ceremony with a WebAuthn-unavailable fallback note. */
import type { CSSProperties } from 'react';

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
        {pending ? 'Waiting for your passkey…' : label}
      </button>
      {supported ? null : (
        <span id={`${id}-fallback`} className="cieo-auth-note">
          This device can’t use passkeys. Use your password or a code instead.
        </span>
      )}
    </span>
  );
}

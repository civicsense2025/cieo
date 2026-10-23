'use client';
/* AuthSsoButtons. One button per identity provider; pending copy swaps in place alongside aria-busy. */
import type { CSSProperties } from 'react';
import { AuthSwapText } from '../AuthSignInCard/AuthMotion.js';

export interface AuthSsoProvider {
  id: string;
  label: string;
}

export interface AuthSsoButtonsProps {
  id: string;
  providers: AuthSsoProvider[];
  /** Id of the provider with a redirect in flight. */
  pendingId?: string;
  style?: CSSProperties;
  onPress?: (id: string) => void;
}

export function AuthSsoButtons({ id, providers, pendingId, style, onPress }: AuthSsoButtonsProps) {
  return (
    <span className="cieo cieo-auth-sso-buttons" role="group" aria-label="Continue with single sign-on" style={style}>
      {providers.map(p => {
        const pending = pendingId === p.id;
        const busy = pendingId != null;
        return (
          <button
            key={p.id}
            type="button"
            id={`${id}-${p.id}`}
            className="cieo-auth-sso-button"
            disabled={busy}
            aria-busy={pending || undefined}
            onClick={() => { if (!busy) onPress?.(p.id); }}
          >
            <AuthSwapText value={pending ? `Connecting to ${p.label}…` : `Continue with ${p.label}`} />
          </button>
        );
      })}
    </span>
  );
}

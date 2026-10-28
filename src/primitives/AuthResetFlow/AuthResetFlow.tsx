'use client';
/* AuthResetFlow. Reset card whose request and confirmation panes share the auth motion frame. */
import type { CSSProperties } from 'react';
import { AuthCardShell, type AuthCardSlotProps, type AuthCardSlots } from '../AuthSignInCard/AuthSignInCard.js';
import { AuthResetForm } from '../AuthResetForm/AuthResetForm.js';

export interface AuthResetFlowProps {
  className?: string;
  slotProps?: AuthCardSlotProps;
  slots?: AuthCardSlots;
  id: string;
  title?: string;
  step: 'request' | 'confirm';
  pending?: boolean;
  error?: string;
  status?: string;
  signinHref?: string;
  style?: CSSProperties;
  onRequest: (email: string) => void;
  onConfirm: (password: string) => void;
}

export function AuthResetFlow({ id, title = 'Reset your password', step, pending, error, status, signinHref, style, onRequest, onConfirm, className, slotProps, slots }: AuthResetFlowProps) {
  return (
    <AuthCardShell className={className} slotProps={slotProps} slots={slots} id={id} title={title} status={status} style={style} footer={signinHref ? <a href={signinHref}>Back to sign in</a> : null}>
      <AuthResetForm id={`${id}-form`} step={step} pending={pending} error={error} onRequest={onRequest} onConfirm={onConfirm} />
    </AuthCardShell>
  );
}

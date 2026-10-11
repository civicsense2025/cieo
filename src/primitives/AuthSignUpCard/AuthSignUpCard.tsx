'use client';
/* AuthSignUpCard (static). Full sign-up card with heading, credentials, routes, and status. */
import type { CSSProperties } from 'react';
import { AuthCardShell } from '../AuthSignInCard/AuthSignInCard';
import { AuthCredentialForm } from '../AuthCredentialForm/AuthCredentialForm';

export interface AuthSignUpCardProps {
  id: string;
  title?: string;
  pending?: boolean;
  error?: string;
  status?: string;
  signinHref?: string;
  style?: CSSProperties;
  onSubmit: (values: { email: string; password: string }) => void;
}

export function AuthSignUpCard({ id, title = 'Create your account', pending, error, status, signinHref, style, onSubmit }: AuthSignUpCardProps) {
  return (
    <AuthCardShell id={id} title={title} status={status} style={style} footer={signinHref ? <a href={signinHref}>Already have an account? Sign in</a> : null}>
      <AuthCredentialForm id={`${id}-form`} mode="signup" pending={pending} error={error} onSubmit={onSubmit} />
    </AuthCardShell>
  );
}

'use client';
/* AuthSignInCard (static). Full sign-in card with heading, credentials, routes, and status. */
import type { CSSProperties, ReactNode } from 'react';
import { AuthCredentialForm } from '../AuthCredentialForm/AuthCredentialForm.js';

export interface AuthSignInCardProps {
  id: string;
  title?: string;
  pending?: boolean;
  error?: string;
  status?: string;
  magicLinkHref?: string;
  resetHref?: string;
  signupHref?: string;
  style?: CSSProperties;
  onSubmit: (values: { email: string; password: string }) => void;
}

export function AuthCardShell({ id, title, status, style, children, footer }: { id: string; title: string; status?: string; style?: CSSProperties; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="cieo cieo-auth-card" aria-labelledby={`${id}-title`} style={style}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`}>{title}</h2>
      {children}
      {status ? <p className="cieo-auth-status" role="status">{status}</p> : null}
      {footer ? <p className="cieo-auth-routes">{footer}</p> : null}
    </section>
  );
}

export function AuthSignInCard({ id, title = 'Sign in', pending, error, status, magicLinkHref, resetHref, signupHref, style, onSubmit }: AuthSignInCardProps) {
  return (
    <AuthCardShell id={id} title={title} status={status} style={style} footer={<>
      {magicLinkHref ? <a href={magicLinkHref}>Email me a link instead</a> : null}
      {resetHref ? <a href={resetHref}>Forgot password?</a> : null}
      {signupHref ? <a href={signupHref}>Create an account</a> : null}
    </>}>
      <AuthCredentialForm id={`${id}-form`} mode="signin" pending={pending} error={error} onSubmit={onSubmit} />
    </AuthCardShell>
  );
}

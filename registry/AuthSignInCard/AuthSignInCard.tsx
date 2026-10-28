'use client';
/* AuthSignInCard. Full sign-in card with spring-led labels and status presence. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { CSSProperties, ReactNode } from 'react';
import { AuthCredentialForm } from '../AuthCredentialForm/AuthCredentialForm.js';
import { AuthMotionMessage } from './AuthMotion.js';

export interface AuthCardSlotProps { root?: PrimitivePartProps; title?: PrimitivePartProps; footer?: PrimitivePartProps; }
export interface AuthCardSlots { beforeForm?: ReactNode; afterForm?: ReactNode; footer?: ReactNode; }

export interface AuthSignInCardProps {
  className?: string;
  slotProps?: AuthCardSlotProps;
  slots?: AuthCardSlots;
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

export function AuthCardShell({ id, title, status, style, children, footer, className, slotProps, slots }: { className?: string; slotProps?: AuthCardSlotProps; slots?: AuthCardSlots; id: string; title: string; status?: string; style?: CSSProperties; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="cieo cieo-auth-card" aria-labelledby={`${id}-title`} style={style} {...customizePart(slotProps?.root, 'cieo cieo-auth-card', style, className)}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`} {...customizePart(slotProps?.title, 'cieo-auth-card-title')}>{title}</h2>
      {slots?.beforeForm}
      {children}
      {slots?.afterForm}
      <AuthMotionMessage className="cieo-auth-status" role="status" value={status} />
      {slots?.footer !== undefined ? (slots.footer === null ? null : <div className="cieo-auth-routes" {...customizePart(slotProps?.footer, 'cieo-auth-routes')}>{slots.footer}</div>) : (footer ? <p className="cieo-auth-routes" {...customizePart(slotProps?.footer, 'cieo-auth-routes')}>{footer}</p> : null)}
    </section>
  );
}

export function AuthSignInCard({ id, title = 'Sign in', pending, error, status, magicLinkHref, resetHref, signupHref, style, onSubmit, className, slotProps, slots }: AuthSignInCardProps) {
  return (
    <AuthCardShell className={className} slotProps={slotProps} slots={slots} id={id} title={title} status={status} style={style} footer={<>
      {magicLinkHref ? <a href={magicLinkHref}>Email me a link instead</a> : null}
      {resetHref ? <a href={resetHref}>Forgot password?</a> : null}
      {signupHref ? <a href={signupHref}>Create an account</a> : null}
    </>}>
      <AuthCredentialForm id={`${id}-form`} mode="signin" pending={pending} error={error} onSubmit={onSubmit} />
    </AuthCardShell>
  );
}

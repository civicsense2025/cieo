'use client';
/* AuthSignInCard. Full sign-in card with spring-led labels and status presence. */
import type { CSSProperties } from 'react';
import { AuthCredentialForm } from '../AuthCredentialForm/AuthCredentialForm.js';
import { AuthCardShell, AuthMotionMessage, type AuthCardSlotProps, type AuthCardSlots } from '../auth-shared.js';
export { AuthCardShell, type AuthCardSlotProps, type AuthCardSlots } from '../auth-shared.js';


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

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthAccountCard } from '../../src/primitives/AuthAccountCard/AuthAccountCard';
import { AuthCredentialForm } from '../../src/primitives/AuthCredentialForm/AuthCredentialForm';
import { AuthEmailField } from '../../src/primitives/AuthEmailField/AuthEmailField';
import { AuthMfaChallenge } from '../../src/primitives/AuthMfaChallenge/AuthMfaChallenge';
import { AuthOtpInput } from '../../src/primitives/AuthOtpInput/AuthOtpInput';
import { AuthPasswordInput } from '../../src/primitives/AuthPasswordInput/AuthPasswordInput';
import { AuthResetForm } from '../../src/primitives/AuthResetForm/AuthResetForm';
import { AuthSessionList, type AuthSession } from '../../src/primitives/AuthSessionList/AuthSessionList';

const hooks: Record<string, (...args: any[]) => void> = {};
(window as any).hooks = hooks;
(window as any).ready = false;

function Box({ id, children }: { id: string; children: React.ReactNode }) {
  return <section id={id} style={{ marginBlockEnd: 24 }}>{children}</section>;
}

function PendingFixture() {
  const [pending, setPending] = useState(false);
  hooks.setPending = setPending;
  return <Box id="pending"><AuthCredentialForm id="pending-form" pending={pending} onSubmit={() => setPending(true)} /></Box>;
}

function ResetFixture() {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  hooks.setResetStep = setStep;
  return <Box id="reset"><AuthResetForm id="reset-form" step={step} onRequest={() => setStep('confirm')} onConfirm={() => {}} /></Box>;
}

function PasswordFixture() {
  const [value, setValue] = useState('');
  return <Box id="password"><AuthPasswordInput id="motion-password" value={value} onChange={setValue} /></Box>;
}

function ErrorFixture() {
  const [error, setError] = useState<string | undefined>();
  hooks.setEmailError = setError;
  return <Box id="error"><AuthEmailField id="motion-email" error={error} /></Box>;
}

const SESSION_FIXTURE: AuthSession[] = [
  { id: 'mac', device: 'MacBook Pro', location: 'Portland', lastActive: 'Now', current: true },
  { id: 'phone', device: 'iPhone 15', location: 'Portland', lastActive: '2 hours ago' },
  { id: 'tablet', device: 'iPad Air', location: 'Seattle', lastActive: 'Yesterday' },
];

function SessionsFixture() {
  const [sessions, setSessions] = useState(SESSION_FIXTURE);
  hooks.resetSessions = () => setSessions(SESSION_FIXTURE);
  return <Box id="sessions"><AuthSessionList id="motion-sessions" sessions={sessions} onRevoke={(id) => setSessions((current) => current.filter((session) => session.id !== id))} /></Box>;
}

function App() {
  return <>
    <SessionsFixture />
    <Box id="mfa"><AuthMfaChallenge id="mfa-form" onSubmit={() => {}} onRecovery={() => {}} /></Box>
    <Box id="otp"><AuthOtpInput id="motion-otp" onComplete={() => {}} /></Box>
    <ResetFixture />
    <Box id="account"><AuthAccountCard id="account-card" name="Ava" email="ava@example.com" avatarInitials="AV" signOutConfirm onSignOut={() => {}} /></Box>
    <PendingFixture />
    <PasswordFixture />
    <ErrorFixture />
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
requestAnimationFrame(() => { (window as any).ready = true; });

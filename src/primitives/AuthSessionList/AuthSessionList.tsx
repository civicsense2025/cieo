'use client';
/* AuthSessionList (static). Device sessions; the current session is text-marked and never revocable. */
import type { CSSProperties } from 'react';

export interface AuthSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
}

export interface AuthSessionListProps {
  id: string;
  sessions: AuthSession[];
  style?: CSSProperties;
  onRevoke: (id: string) => void;
}

export function AuthSessionList({ id, sessions, style, onRevoke }: AuthSessionListProps) {
  return (
    <section className="cieo cieo-auth-session-list" aria-labelledby={`${id}-title`} style={style}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`}>Sessions</h2>
      <ul className="cieo-auth-sessions" role="list">
        {sessions.map((s) => (
          <li key={s.id} className="cieo-auth-session" role="listitem">
            <span className="cieo-auth-session-device">{s.device}</span>
            <span className="cieo-auth-session-meta">{s.location} · {s.lastActive}</span>
            {s.current ? (
              <span className="cieo-auth-session-current">This device</span>
            ) : (
              <button type="button" className="cieo-auth-revoke" aria-label={`Revoke ${s.device} session`} onClick={() => onRevoke(s.id)}>
                {`Revoke ${s.device}`}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

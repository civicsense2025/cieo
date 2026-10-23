'use client';
/* AuthSessionList. Removal is immediate; surviving device rows reflow on Cieo's base spring. */
import { useRef, type CSSProperties, type RefObject } from 'react';
import { useFlip } from '../../react/index.js';
import { useAuthMotionDisabled } from '../AuthSignInCard/AuthMotion.js';

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

function SessionReflow({ list, order }: { list: RefObject<HTMLUListElement | null>; order: string }) {
  useFlip(list, order, { stagger: 0.02 });
  return null;
}

export function AuthSessionList({ id, sessions, style, onRevoke }: AuthSessionListProps) {
  const list = useRef<HTMLUListElement>(null);
  const motionDisabled = useAuthMotionDisabled(list);
  const order = sessions.map((session) => session.id).join('\u0000');
  return (
    <section className="cieo cieo-auth-session-list" aria-labelledby={`${id}-title`} style={style}>
      <h2 className="cieo-auth-card-title" id={`${id}-title`}>Sessions</h2>
      <ul ref={list} className="cieo-auth-sessions" role="list">
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
      {motionDisabled ? null : <SessionReflow list={list} order={order} />}
    </section>
  );
}

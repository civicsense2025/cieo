// src/primitives/Timer/Timer.tsx
'use client';
/* Timer. Elapsed or remaining seconds rendered as mm:ss. */
export interface TimerProps {
  /** Total seconds. Required. */
  seconds: number;
}

export function Timer({ seconds }: TimerProps) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <time dateTime={`PT${seconds}S`} className="cieo cieo-p-timer">
      {mm}:{ss}
    </time>
  );
}

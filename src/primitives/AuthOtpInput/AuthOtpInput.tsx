'use client';
/* AuthOtpInput (static). Digit boxes for verification codes. Paste with spaces or dashes normalizes to digits; focus advances on entry and retreats on Backspace. */
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export interface AuthOtpInputProps {
  id: string;
  /** Number of boxes, 4-8. Defaults to 6. */
  length?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  style?: CSSProperties;
  /** Fires once the last box fills. */
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
}

export function AuthOtpInput({ id, length = 6, label = 'Verification code', error, disabled, style, onComplete, onChange }: AuthOtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ''));
  const boxes = useRef<Array<HTMLInputElement | null>>([]);
  const describedBy = error ? `${id}-error` : undefined;

  const commit = (next: string[]) => {
    setDigits(next);
    const code = next.join('');
    onChange?.(code);
    if (next.every(d => d !== '')) onComplete?.(code);
  };
  const focusBox = (i: number) => boxes.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const onPasteText = (text: string, start: number) => {
    const clean = text.replace(/\D/g, '').slice(0, length - start);
    if (!clean) return;
    const next = [...digits];
    for (let k = 0; k < clean.length; k += 1) next[start + k] = clean[k];
    commit(next);
    focusBox(start + clean.length);
  };

  return (
    <span className="cieo cieo-auth-otp-input" data-invalid={error ? 'true' : undefined} style={style} role="group" aria-labelledby={`${id}-label`}>
      <span className="cieo-auth-label" id={`${id}-label`}>{label}</span>
      <span className="cieo-auth-otp-boxes">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { boxes.current[i] = el; }}
            className="cieo-auth-otp-box"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={d}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '');
              if (raw.length > 1) { onPasteText(raw, i); return; }
              const v = raw.slice(-1);
              if (!v && e.target.value) return;
              const next = [...digits];
              next[i] = v;
              commit(next);
              if (v) focusBox(i + 1);
            }}
            onKeyDown={e => {
              if (e.key === 'Backspace' && !digits[i]) focusBox(i - 1);
            }}
            onPaste={e => { e.preventDefault(); onPasteText(e.clipboardData.getData('text'), i); }}
          />
        ))}
      </span>
      {error ? <span id={`${id}-error`} className="cieo-auth-error" role="alert">{error}</span> : null}
    </span>
  );
}

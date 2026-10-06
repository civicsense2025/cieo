/* Text field status machine, after the field recipe: a field settles into neutral, valid or invalid on blur.
   While typing it only ever relaxes (invalid to valid once fixed, valid to neutral once broken), so it never
   scolds mid-word. Pure, unit-tested. */

export type FieldStatus = 'neutral' | 'valid' | 'invalid';
/** 'invalid' is the native event a form fires on each failing control when a submit is attempted. */
export type FieldEvent = 'input' | 'blur' | 'reset' | 'invalid';

export interface FieldReading {
  /** The value is empty. */
  empty: boolean;
  /** The value passes native constraints and the custom validator. */
  valid: boolean;
  /** The field has any rule to pass (required, pattern, type=email, validate...). Without one it never shows valid. */
  checks: boolean;
}

export function nextFieldStatus(prev: FieldStatus, event: FieldEvent, r: FieldReading): FieldStatus {
  const ok: FieldStatus = r.checks ? 'valid' : 'neutral';
  switch (event) {
    case 'reset':
      return 'neutral';
    case 'invalid':
      return 'invalid';
    case 'blur':
      /* Tabbing through an empty field is not a mistake; a submit attempt marks it through 'invalid', and leaving it
         empty afterwards keeps that mark. */
      if (r.empty) return prev === 'invalid' && !r.valid ? 'invalid' : 'neutral';
      return r.valid ? ok : 'invalid';
    case 'input':
      if (prev === 'invalid' && r.valid) return ok;
      if (prev === 'valid' && !r.valid) return 'neutral';
      return prev;
  }
}

/** The status on screen: a controlled `status` wins, then an `error` from the server or the app, then the machine. */
export function resolveFieldStatus(machine: FieldStatus, opts: { status?: FieldStatus; error?: unknown }): FieldStatus {
  if (opts.status) return opts.status;
  if (opts.error !== undefined && opts.error !== null && opts.error !== false && opts.error !== '') return 'invalid';
  return machine;
}

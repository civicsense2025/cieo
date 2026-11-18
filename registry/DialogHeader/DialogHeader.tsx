// src/primitives/DialogHeader/DialogHeader.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* DialogHeader. Title row for a dialog with an optional close button. Layout only; the host owns dismissal. */

export interface DialogHeaderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Visible dialog title. Required. */
  title: string;
  /** Called when the close button is pressed. Omit to render no button. */
  onClose?: () => void;
  /** Close button label. Defaults to Close. */
  closeLabel?: string;
}

export function DialogHeader({ className, slotProps, title, onClose, closeLabel = 'Close' }: DialogHeaderProps) {
  return (
    <div className="cieo cieo-dialog-header" {...customizePart(slotProps?.root, "cieo cieo-dialog-header", undefined, className)}>
      <h2>{title}</h2>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m5 5 10 10M15 5 5 15" /></svg>
        </button>
      ) : null}
    </div>
  );
}

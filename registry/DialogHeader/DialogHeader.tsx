// src/primitives/DialogHeader/DialogHeader.tsx
'use client';
/* DialogHeader. Title row for a dialog with an optional close button. Layout only; the host owns dismissal. */

export interface DialogHeaderProps {
  /** Visible dialog title. Required. */
  title: string;
  /** Called when the close button is pressed. Omit to render no button. */
  onClose?: () => void;
  /** Close button label. Defaults to Close. */
  closeLabel?: string;
}

export function DialogHeader({ title, onClose, closeLabel = 'Close' }: DialogHeaderProps) {
  return (
    <div className="cieo cieo-dialog-header">
      <h2>{title}</h2>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label={closeLabel}>
          {closeLabel}
        </button>
      ) : null}
    </div>
  );
}

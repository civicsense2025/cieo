'use client';
/* Overlay. Full-viewport scrim behind dialogs and sheets. Presentational only; the host owns open state and dismissal. */
export function Overlay() {
  return (<div aria-hidden="true" className="cieo cieo-p-overlay" />);
}

'use client';
/* Overlay. Full-viewport scrim behind dialogs and sheets. Presentational; pressing it calls onPress so the host can dismiss. */
export interface OverlayProps {
  /** Called when the scrim is pressed. Optional. */
  onPress?: () => void;
}
export function Overlay({ onPress }: OverlayProps = {}) {
  return (<div aria-hidden="true" onClick={onPress} className="cieo cieo-p-overlay" />);
}

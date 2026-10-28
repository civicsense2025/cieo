'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Overlay. Full-viewport scrim behind dialogs and sheets. Presentational; pressing it calls onPress so the host can dismiss. */
export interface OverlayProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Called when the scrim is pressed. Optional. */
  onPress?: () => void;
}
export function Overlay({ className, slotProps, onPress }: OverlayProps = {}) {
  return (<div aria-hidden="true" onClick={onPress} className="cieo cieo-p-overlay" {...customizePart(slotProps?.root, "cieo cieo-p-overlay", undefined, className)} />);
}

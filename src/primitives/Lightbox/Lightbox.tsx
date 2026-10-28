'use client';
/* Lightbox. Image viewer dialog over a scrim. Fades in on open; plays the exit spring before unmounting on close. Host owns open state. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { useRef } from 'react';
import { useDismiss, useModalFocus, usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';
export interface LightboxProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; image?: PrimitivePartProps; close?: PrimitivePartProps };
  /** Image source. Required. */
  src: string;
  /** Image alternative text. Required. */
  alt: string;
  /** Whether the viewer is open. Plays exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape, scrim press or host close affordances. Optional. */
  onClose?: () => void;
  /** Whether pressing the scrim calls onClose. Defaults to true. */
  dismissOnOutsidePress?: boolean;
  /** Accessible name for the viewer dialog. Defaults to Image viewer. */
  label?: string;
}
const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;
export function Lightbox({ src, alt, open, onClose, dismissOnOutsidePress = true, label = 'Image viewer', motion, entering = 'fade', exiting = 'fade', className, slotProps }: LightboxProps) {
  const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const { mounted, ref } = usePresence<HTMLDivElement>(open ?? false, { disabled: motion === false, from: origin });
  const onTab = useModalFocus(open ?? false, ref);
  useDismiss(open ?? false, () => onClose?.(), [ref], { outside: false });
  if (!mounted) return null;
  void exiting;
  return (<><Overlay onPress={dismissOnOutsidePress ? onClose : undefined} /><div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onKeyDown={onTab} className="cieo cieo-lightbox" {...motionAttrs({ motion, entering, exiting })} {...customizePart(slotProps?.root, "cieo cieo-lightbox", undefined, className)}><img src={src} alt={alt}  {...customizePart(slotProps?.image, undefined, undefined)}/>{onClose ? (<button type="button" onClick={onClose} aria-label="Close viewer" {...customizePart(slotProps?.close, undefined, undefined)}>Close</button>) : null}</div></>);
}

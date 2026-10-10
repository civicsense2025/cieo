// src/primitives/Lightbox/Lightbox.tsx
'use client';
/* Lightbox. Image viewer dialog over a scrim. Renders null when closed; host owns open state. */
import type { KeyboardEvent } from 'react';
import { motionAttrs, type MotionProps } from '../motion.js';
import { Overlay } from '../Overlay/Overlay.js';

export interface LightboxProps extends MotionProps {
  /** Image source. Required. */
  src: string;
  /** Image alternative text. Required. */
  alt: string;
  /** Whether the viewer is open. Renders null when false or omitted. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  /** Accessible name for the viewer dialog. Defaults to Image viewer. */
  label?: string;
}

export function Lightbox({ src, alt, open, onClose, label = 'Image viewer', motion, entering = 'fade', exiting = 'fade' }: LightboxProps) {
  if (!open) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose?.();
  };
  return (
    <>
      <Overlay />
      <div role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKeyDown} className="cieo cieo-lightbox" {...motionAttrs({ motion, entering, exiting })}>
        <img src={src} alt={alt} />
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close viewer">
            Close
          </button>
        ) : null}
      </div>
    </>
  );
}

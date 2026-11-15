'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* PreviewStage. Single-image zoom stage with backdrop switch, zoom toolbar, and fit toggle. Host owns the media and the zoom value. */
import type { ReactNode } from 'react';
import { Digits } from '../../react/index.js';
import { motionAttrs, type MotionProps } from '../motion.js';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl.js';
import { SegmentedControlItem } from '../SegmentedControlItem/SegmentedControlItem.js';

export type PreviewBackdrop = 'checker' | 'light' | 'dark';

export interface PreviewStageProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; viewport?: PrimitivePartProps; media?: PrimitivePartProps; toolbar?: PrimitivePartProps; zoom?: PrimitivePartProps };

  /** Accessible name for the preview region (e.g. "Vector result"). Required. */
  label: string;
  /** Backdrop behind transparent artwork. Defaults to checker. */
  backdrop?: PreviewBackdrop;
  /** Called with the picked backdrop. Omit to hide the backdrop switch. */
  onBackdropChange?: (backdrop: PreviewBackdrop) => void;
  /** Accessible name for the backdrop switch. Defaults to Preview backdrop. */
  backdropLabel?: string;
  /** Visible names for the three backdrops. Defaults to English. */
  backdropNames?: { checker?: string; light?: string; dark?: string };
  /** Zoom factor, 1 = 100%. Host owns the value. */
  zoom?: number;
  /** Called with the new zoom. Omit to hide zoom controls. */
  onZoomChange?: (zoom: number) => void;
  /** Zoom step for the toolbar buttons. Defaults to 0.25. */
  zoomStep?: number;
  /** Maximum toolbar zoom. Defaults to 8. */
  maxZoom?: number;
  /** Whether the media fits the viewport. Host owns the value. */
  fitted?: boolean;
  /** Called with the new fit state. Omit to hide the fit toggle. */
  onFitChange?: (fitted: boolean) => void;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  zoomResetLabel?: string;
  fitLabel?: string;
  /** Media to stage. Required. */
  children: ReactNode;
  /** Dimensions or status line under the toolbar. */
  caption?: ReactNode;
}

const BACKDROPS: PreviewBackdrop[] = ['checker', 'light', 'dark'];

export function PreviewStage({ className, slotProps, label, backdrop = 'checker', onBackdropChange, backdropLabel = 'Preview backdrop', backdropNames, zoom = 1, onZoomChange, zoomStep = 0.25, maxZoom = 8, fitted = true, onFitChange, zoomInLabel = 'Zoom in', zoomOutLabel = 'Zoom out', zoomResetLabel = 'Reset zoom', fitLabel = 'Fit to viewport', children, caption, motion, entering, exiting }: PreviewStageProps) {
  const shown = onZoomChange || onFitChange ? (
    <div className="cieo-stage-toolbar" {...customizePart(slotProps?.toolbar, "cieo-stage-toolbar", undefined)}>
      {onZoomChange ? (
        <div className="cieo-stage-zoom" {...customizePart(slotProps?.zoom, "cieo-stage-zoom", undefined)}>
          <button type="button" aria-label={zoomOutLabel} disabled={zoom <= zoomStep} onClick={() => onZoomChange(Math.max(zoomStep, +(zoom - zoomStep).toFixed(3)))}>−</button>
          <button type="button" aria-label={zoomResetLabel} onClick={() => onZoomChange(1)}>
            <Digits value={Math.round(zoom * 100)} />%
          </button>
          <button type="button" aria-label={zoomInLabel} disabled={zoom >= maxZoom} onClick={() => onZoomChange(Math.min(maxZoom, +(zoom + zoomStep).toFixed(3)))}>+</button>
        </div>
      ) : null}
      {onFitChange ? (
        <button type="button" aria-pressed={fitted} onClick={() => onFitChange(!fitted)}>{fitLabel}</button>
      ) : null}
    </div>
  ) : null;

  return (
    <figure className="cieo cieo-stage" {...motionAttrs({ motion, entering, exiting })} {...customizePart(slotProps?.root, "cieo cieo-stage", undefined, className)}>
      <div role="region" aria-label={label} tabIndex={0} data-backdrop={backdrop} data-fitted={fitted || undefined} className="cieo-stage-viewport" {...customizePart(slotProps?.viewport, "cieo-stage-viewport", undefined)}>
        <div className="cieo-stage-media" style={fitted ? undefined : { scale: String(zoom) }} {...customizePart(slotProps?.media, "cieo-stage-media", undefined)}>
          {children}
        </div>
      </div>
      {shown}
      {onBackdropChange ? (
        <SegmentedControl label={backdropLabel} value={backdrop} onValueChange={(v) => onBackdropChange(v as PreviewBackdrop)}>
          {BACKDROPS.map((b) => (
            <SegmentedControlItem key={b} value={b}>{backdropNames?.[b] ?? b}</SegmentedControlItem>
          ))}
        </SegmentedControl>
      ) : null}
      {caption}
    </figure>
  );
}

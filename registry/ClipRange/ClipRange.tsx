'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ClipRange. Start + length pair of native range inputs for trimming media. Host owns both values; the length
   ceiling follows the picked start so the clip never runs past max. */
import { useId, type ReactNode } from 'react';

export interface ClipRangeProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; start?: PrimitivePartProps; length?: PrimitivePartProps; value?: PrimitivePartProps };

  /** Accessible name for the pair (e.g. "Clip range"). Required. */
  label: string;
  /** Label for the start input (e.g. "Start"). Required. */
  startLabel: string;
  /** Label for the length input (e.g. "Length"). Required. */
  lengthLabel: string;
  /** Range floor in seconds. */
  min?: number;
  /** Media duration in seconds. Required. */
  max: number;
  /** Step in seconds. Defaults to 0.1. */
  step?: number;
  /** Unit shown after values (e.g. "s"). */
  unit?: string;
  /** Clip start in seconds. Host owns the value. Required. */
  start: number;
  /** Clip length in seconds. Host owns the value. Required. */
  length: number;
  /** Called with the clamped start. */
  onStartChange?: (start: number) => void;
  /** Called with the clamped length. */
  onLengthChange?: (length: number) => void;
  /** Disables both sliders. */
  disabled?: boolean;
  /** Formats seconds for the readout. Defaults to m:ss.t. */
  formatValue?: (seconds: number) => string;
  /** Extra help or budget note under the pair. */
  children?: ReactNode;
}

/** Formats seconds as m:ss.t for clip readouts. */
export function formatClipTime(seconds: number): string {
  const clamped = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped % 60);
  const t = Math.floor((clamped % 1) * 10);
  return `${m}:${String(s).padStart(2, '0')}.${t}`;
}

export function ClipRange({ className, slotProps, label, startLabel, lengthLabel, min = 0, max, step = 0.1, unit, start, length, disabled, onStartChange, onLengthChange, formatValue = formatClipTime, children }: ClipRangeProps) {
  const uid = useId();
  const startId = `${uid}-start`;
  const lengthId = `${uid}-length`;
  const valueId = `${uid}-value`;
  const clampedStart = Math.min(max, Math.max(min, start));
  const lengthCeiling = Math.max(step, max - clampedStart);
  const end = clampedStart + Math.min(length, lengthCeiling);
  return (
    <div role="group" aria-label={label} className="cieo cieo-clip-range" {...customizePart(slotProps?.root, "cieo cieo-clip-range", undefined, className)}>
      <div className="cieo-clip-range-row" {...customizePart(slotProps?.start, "cieo-clip-range-row", undefined)}>
        <label htmlFor={startId}>{startLabel}</label>
        <input id={startId} type="range" min={min} max={max} step={step} value={clampedStart} disabled={disabled} onChange={(e) => onStartChange?.(Math.min(max, Math.max(min, Number(e.target.value))))} />
      </div>
      <div className="cieo-clip-range-row" {...customizePart(slotProps?.length, "cieo-clip-range-row", undefined)}>
        <label htmlFor={lengthId}>{lengthLabel}</label>
        <input id={lengthId} type="range" min={step} max={lengthCeiling} step={step} value={Math.min(length, lengthCeiling)} disabled={disabled} onChange={(e) => onLengthChange?.(Math.min(lengthCeiling, Math.max(step, Number(e.target.value))))} />
      </div>
      <output htmlFor={`${startId} ${lengthId}`} id={valueId} className="cieo-clip-range-value" {...customizePart(slotProps?.value, "cieo-clip-range-value", undefined)}>
        {formatValue(clampedStart)} – {formatValue(end)}{unit ? ` ${unit}` : ''}
      </output>
      {children}
    </div>
  );
}

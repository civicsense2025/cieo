'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* DropZone. File drop target with an explicit Choose button. The button calls input.click(); nothing relies on implicit label activation. */
import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Button } from '../../controls/Button.js';

export interface DropZoneProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; button?: PrimitivePartProps; input?: PrimitivePartProps; hint?: PrimitivePartProps; error?: PrimitivePartProps };

  /** Accessible name for the drop region (e.g. "Source image"). Required. */
  label: string;
  /** Text of the explicit Choose button (e.g. "Choose image"). Required. */
  chooseLabel: string;
  /** Formats and limits line (e.g. "PNG or JPEG · 25 MB max"). */
  hint?: string;
  /** File dialog filter. Defaults to images. */
  accept?: string;
  /** Allow more than one file. Defaults to false. */
  multiple?: boolean;
  /** Disables the button, the input, and dropping. */
  disabled?: boolean;
  /** Error message; marks the zone and announces once via role=alert. */
  error?: string;
  /** Called with the dropped or chosen files. Host clears error state on success. */
  onFiles?: (files: File[]) => void;
  /** Illustration or promise copy above the button. */
  children?: ReactNode;
}

function hasFiles(e: DragEvent): boolean {
  return [...(e.dataTransfer?.types ?? [])].includes('Files');
}

export function DropZone({ className, slotProps, label, chooseLabel, hint, accept = 'image/png,image/jpeg,.png,.jpg,.jpeg', multiple = false, disabled = false, error, onFiles, children }: DropZoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [over, setOver] = useState(false);

  function choose() {
    if (!disabled) input.current?.click();
  }
  function take(files: FileList | File[] | null) {
    const list = files ? [...files] : [];
    if (list.length && !disabled) onFiles?.(list);
  }
  function onDragEnter(e: DragEvent) {
    if (disabled || !hasFiles(e)) return;
    depth.current += 1;
    setOver(true);
  }
  function onDragLeave() {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setOver(false);
  }
  function onDragOver(e: DragEvent) {
    if (disabled || !hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
  function onDrop(e: DragEvent) {
    if (disabled || !hasFiles(e)) return;
    e.preventDefault();
    e.stopPropagation();
    depth.current = 0;
    setOver(false);
    take(e.dataTransfer.files);
  }
  return (
    <div
      role="region"
      aria-label={label}
      aria-disabled={disabled || undefined}
      data-dragover={over || undefined}
      data-error={error ? 'true' : undefined}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="cieo cieo-dropzone"
      {...customizePart(slotProps?.root, "cieo cieo-dropzone", undefined, className)}
    >
      {children}
      <Button type="button" variant="primary" size="sm" shape="pill" disabled={disabled} onClick={choose} {...customizePart(slotProps?.button, undefined, undefined)}>
        {chooseLabel}
      </Button>
      <input
        ref={input}
        type="file"
        className="cieo-vh"
        tabIndex={-1}
        aria-hidden="true"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          take(e.target.files);
          e.target.value = '';
        }}
        {...customizePart(slotProps?.input, "cieo-vh", undefined)}
      />
      {hint ? <p className="cieo-dropzone-hint" {...customizePart(slotProps?.hint, "cieo-dropzone-hint", undefined)}>{hint}</p> : null}
      {error ? <p role="alert" className="cieo-dropzone-error" {...customizePart(slotProps?.error, "cieo-dropzone-error", undefined)}>{error}</p> : null}
    </div>
  );
}

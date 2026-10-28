'use client';
/* ResizeHandle. Drag separator between resizable regions. Host owns the drag: attach onPointerDown and friends via rest props. */
import type * as React from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ResizeHandleProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Separator orientation. Defaults to vertical. */
  orientation?: 'vertical' | 'horizontal';
  /** Accessible name (e.g. "Resize sidebar"). Optional. */
  label?: string;
}

export function ResizeHandle({ className, slotProps, orientation = 'vertical', label, ...rest }: ResizeHandleProps & React.HTMLAttributes<HTMLDivElement>) {
  return (<div role="separator" aria-orientation={orientation} aria-label={label} data-orientation={orientation} className="cieo cieo-p-resize" {...rest} {...customizePart(slotProps?.root, "cieo cieo-p-resize", undefined, className)} />);
}

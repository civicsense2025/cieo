'use client';
/* ResizeHandle. Drag separator between resizable regions. Host owns the drag: attach onPointerDown and friends via rest props. */
import type * as React from 'react';

export interface ResizeHandleProps {
  /** Separator orientation. Defaults to vertical. */
  orientation?: 'vertical' | 'horizontal';
  /** Accessible name (e.g. "Resize sidebar"). Optional. */
  label?: string;
}

export function ResizeHandle({ orientation = 'vertical', label, ...rest }: ResizeHandleProps & React.HTMLAttributes<HTMLDivElement>) {
  return (<div role="separator" aria-orientation={orientation} aria-label={label} data-orientation={orientation} className="cieo cieo-p-resize" {...rest} />);
}

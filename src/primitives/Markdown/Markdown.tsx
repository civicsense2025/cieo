// src/primitives/Markdown/Markdown.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Markdown. Renders host-sanitized HTML. The host sanitizes before passing; this component never sanitizes. */
export interface MarkdownProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Sanitized HTML string. Must already be safe; rendered verbatim. */
  html: string;
}

export function Markdown({ className, slotProps, html }: MarkdownProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} className="cieo cieo-p-markdown" {...customizePart(slotProps?.root, "cieo cieo-p-markdown", undefined, className)} />;
}

// src/primitives/Markdown/Markdown.tsx
'use client';
/* Markdown. Renders host-sanitized HTML. The host sanitizes before passing; this component never sanitizes. */
export interface MarkdownProps {
  /** Sanitized HTML string. Must already be safe; rendered verbatim. */
  html: string;
}

export function Markdown({ html }: MarkdownProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} className="cieo cieo-p-markdown" />;
}

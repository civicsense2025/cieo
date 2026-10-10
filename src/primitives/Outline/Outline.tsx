// src/primitives/Outline/Outline.tsx
'use client';
/* Outline. Table-of-contents nav built from an items array; links to section ids. */

export interface OutlineItem {
  id: string;
  label: string;
}

export interface OutlineProps {
  /** Accessible name. Defaults to On this page. */
  label?: string;
  /** Sections to link; each renders an anchor to its id. Required. */
  items: OutlineItem[];
}

export function Outline({ label = 'On this page', items }: OutlineProps) {
  return (
    <nav aria-label={label} className="cieo cieo-outline">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={'#' + item.id}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

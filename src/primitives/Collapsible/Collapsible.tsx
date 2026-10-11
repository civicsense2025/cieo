'use client';
/* Collapsible. Disclosure with internal open state and a controlled override. Host may coordinate several via CollapsibleGroup. */
import { useState, type ReactNode } from 'react';

export interface CollapsibleProps {
  /** Button label for the disclosure. Required. */
  title: string;
  /** Controlled open state; omit for internal state. */
  open?: boolean;
  /** Initial open state for internal state. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state on toggle. */
  onOpenChange?: (open: boolean) => void;
  /** Revealed content. Required. */
  children: ReactNode;
}

export function Collapsible({ title, open, defaultOpen = false, onOpenChange, children }: CollapsibleProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const effective = open ?? internal;
  const toggle = () => {
    const next = !effective;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  return (
    <div data-open={effective} className="cieo cieo-collapsible">
      <button type="button" aria-expanded={effective} onClick={toggle}>
        {title}
      </button>
      {effective ? <div role="region">{children}</div> : null}
    </div>
  );
}

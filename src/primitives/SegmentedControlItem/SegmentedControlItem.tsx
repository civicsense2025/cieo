// src/primitives/SegmentedControlItem/SegmentedControlItem.tsx
'use client';
/* SegmentedControlItem. One segment inside SegmentedControl. Pressed when the control value equals its own value. */
import { useContext, useLayoutEffect, useRef, type ReactNode, type Ref } from 'react';
import { SegmentedControlContext } from '../SegmentedControl/SegmentedControl.js';
import { Slot, mergeRefs } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface SegmentedControlItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  ref?: Ref<HTMLElement>;
  /** Polymorphic child rendering. */
  asChild?: boolean;
  /** Segment key matched against the control value. Required. */
  value: string;
  /** Link target. When set, renders an <a> (with aria-current when picked) so tool switchers keep link semantics. */
  href?: string;
  children: ReactNode;
}

export function SegmentedControlItem({ className, slotProps, ref, asChild = false, value, href, children }: SegmentedControlItemProps) {
  const control = useContext(SegmentedControlContext);
  const picked = control?.value === value;
  const registerItem = control?.registerItem;
  const ownRef = useRef<HTMLElement | null>(null);
  const combinedRef = mergeRefs<HTMLElement>(ownRef, ref);

  useLayoutEffect(() => {
    if (!picked || !registerItem) return;
    const el = ownRef.current;
    if (!el) return;
    registerItem(value, el);
    return () => registerItem(value, null);
  }, [picked, registerItem, value]);

  if (asChild) {
    return (
      <Slot
        asChild
        ref={combinedRef}
        aria-pressed={href === undefined ? picked : undefined}
        aria-current={href !== undefined && picked ? 'page' : undefined}
        data-picked={picked}
        onClick={() => control?.onSelect?.(value)}
        className="cieo cieo-segmented-control-item"
        {...customizePart(slotProps?.root, 'cieo cieo-segmented-control-item', undefined, className)}
      >
        {children}
      </Slot>
    );
  }
  if (href !== undefined) {
    return (
      <a
        ref={combinedRef as Ref<HTMLAnchorElement>}
        href={href}
        aria-current={picked ? 'page' : undefined}
        data-picked={picked}
        onClick={() => control?.onSelect?.(value)}
        className="cieo cieo-segmented-control-item"
        {...customizePart(slotProps?.root, 'cieo cieo-segmented-control-item', undefined, className)}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={combinedRef as Ref<HTMLButtonElement>}
      type="button"
      aria-pressed={picked}
      data-picked={picked}
      onClick={() => control?.onSelect?.(value)}
      className="cieo cieo-segmented-control-item"
      {...customizePart(slotProps?.root, 'cieo cieo-segmented-control-item', undefined, className)}
    >
      {children}
    </button>
  );
}

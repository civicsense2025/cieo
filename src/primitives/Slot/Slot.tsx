'use client';
/* Slot: polymorphic asChild primitive. When asChild is true the single child element replaces the default
   wrapper, merging className, style, ref (including React 19 props.ref), ARIA attributes, and chaining event handlers. */
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** When true, the single child element replaces the wrapper, merging props. */
  asChild?: boolean;
  children?: ReactNode;
}

export function mergeRefs<T = unknown>(...refs: Array<Ref<T> | undefined | null>): Ref<T> | undefined {
  const valid = refs.filter(Boolean) as Ref<T>[];
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  return (value: T | null) => {
    for (const ref of valid) {
      if (typeof ref === 'function') ref(value);
      else if (ref && typeof ref === 'object') (ref as { current: T | null }).current = value;
    }
  };
}

export function mergeSlotProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps };
  for (const [key, childVal] of Object.entries(childProps)) {
    if (key === 'ref') continue;
    const slotVal = slotProps[key];
    if (key === 'className') {
      const cls = [slotVal as string | undefined, childVal as string | undefined].filter(Boolean).join(' ');
      merged[key] = cls.length > 0 ? cls : undefined;
    } else if (key === 'style') {
      merged[key] = slotVal || childVal ? { ...(slotVal as CSSProperties | undefined), ...(childVal as CSSProperties | undefined) } : undefined;
    } else if (/^on[A-Z]/.test(key) && typeof slotVal === 'function' && typeof childVal === 'function') {
      merged[key] = (event: unknown) => {
        (childVal as (e: unknown) => void)(event);
        (slotVal as (e: unknown) => void)(event);
      };
    } else if (childVal !== undefined) {
      merged[key] = childVal;
    }
  }
  return merged;
}

export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(props, ref) {
  const { asChild = false, slotProps, className, style, children, ...rest } = props;
  const customized = customizePart(slotProps?.root, undefined, style, className);
  const baseProps: Record<string, unknown> = {
    ...rest,
    ...customized,
    style: customized.style ?? style,
    className: customized.className ?? className,
  };

  if (!asChild) {
    return (
      <div ref={ref as Ref<HTMLDivElement>} {...(baseProps as HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  const only = Children.count(children) === 1 ? Children.only(children) : null;
  if (!isValidElement(only)) return null;

  const childEl = only as ReactElement<Record<string, unknown>>;
  const childRef = (childEl.props as { ref?: Ref<HTMLElement> }).ref ?? (childEl as unknown as { ref?: Ref<HTMLElement> }).ref;
  const mergedRef = mergeRefs<HTMLElement>(ref, childRef);
  const merged = mergeSlotProps(baseProps, childEl.props);

  return cloneElement(childEl, { ...merged, ...(mergedRef ? { ref: mergedRef } : {}) });
});

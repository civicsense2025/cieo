'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* Slot: polymorphic asChild primitive. When asChild is true the single child element replaces the default
   wrapper, merging className, style, ref (including React 19 props.ref), ARIA attributes, and chaining event handlers. */
import { Children, cloneElement, forwardRef, isValidElement, } from 'react';
import { customizePart } from '../customization.js';
export function mergeRefs(...refs) {
    const valid = refs.filter(Boolean);
    if (valid.length === 0)
        return undefined;
    if (valid.length === 1)
        return valid[0];
    return (value) => {
        for (const ref of valid) {
            if (typeof ref === 'function')
                ref(value);
            else if (ref && typeof ref === 'object')
                ref.current = value;
        }
    };
}
export function mergeSlotProps(slotProps, childProps) {
    const merged = { ...slotProps };
    for (const [key, childVal] of Object.entries(childProps)) {
        if (key === 'ref')
            continue;
        const slotVal = slotProps[key];
        if (key === 'className') {
            const cls = [slotVal, childVal].filter(Boolean).join(' ');
            merged[key] = cls.length > 0 ? cls : undefined;
        }
        else if (key === 'style') {
            merged[key] = slotVal || childVal ? { ...slotVal, ...childVal } : undefined;
        }
        else if (/^on[A-Z]/.test(key) && typeof slotVal === 'function' && typeof childVal === 'function') {
            merged[key] = (event) => {
                childVal(event);
                slotVal(event);
            };
        }
        else if (childVal !== undefined) {
            merged[key] = childVal;
        }
    }
    return merged;
}
export const Slot = forwardRef(function Slot(props, ref) {
    const { asChild = false, slotProps, className, style, children, ...rest } = props;
    const customized = customizePart(slotProps?.root, undefined, style, className);
    const baseProps = {
        ...rest,
        ...customized,
        style: customized.style ?? style,
        className: customized.className ?? className,
    };
    if (!asChild) {
        return (_jsx("div", { ref: ref, ...baseProps, children: children }));
    }
    const only = Children.count(children) === 1 ? Children.only(children) : null;
    if (!isValidElement(only))
        return null;
    const childEl = only;
    const childRef = childEl.props.ref ?? childEl.ref;
    const mergedRef = mergeRefs(ref, childRef);
    const merged = mergeSlotProps(baseProps, childEl.props);
    return cloneElement(childEl, { ...merged, ...(mergedRef ? { ref: mergedRef } : {}) });
});

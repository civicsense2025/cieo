'use client';
/* TextField: a native <input> in the field frame. Without JavaScript it is a labeled input that submits normally. */
import { forwardRef, type InputHTMLAttributes } from 'react';
import { FieldFrame, useField, type FieldFrameSlots, type FieldOwnProps } from './Field.js';
import { customizeControlPart, type ControlPartProps } from './parts.js';

export type TextFieldType = 'text' | 'email' | 'search' | 'url' | 'number' | 'tel' | 'password';

export interface TextFieldSlotProps extends FieldFrameSlots {
  input?: ControlPartProps;
}

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'prefix'> &
  FieldOwnProps & {
    type?: TextFieldType;
    slotProps?: TextFieldSlotProps;
  };

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(props, ref) {
  const { label, description, error, status, validate, onStatusChange, prefix, suffix, slotProps, className, type = 'text', placeholder, id, ...rest } = props;
  const own = { label, description, error, status, validate, onStatusChange, prefix, suffix };
  const field = useField<HTMLInputElement>(own, { ...rest, type }, id);
  const setRef = (el: HTMLInputElement | null) => {
    field.ref.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  return (
    <FieldFrame kind="input" own={own} field={field} floated={!!placeholder} className={className} slotProps={slotProps}>
      {/* A single-space placeholder lets CSS float the label with :placeholder-shown before hydration. */}
      <input
        {...rest}
        {...field.control}
        ref={setRef}
        type={type}
        placeholder={placeholder ?? ' '}
        onChange={(e) => {
          rest.onChange?.(e);
          field.control.onChange(e);
        }}
        onBlur={(e) => {
          field.control.onBlur(e);
          rest.onBlur?.(e);
        }}
        className="cieo-field-control"
        {...customizeControlPart(slotProps?.input, 'cieo-field-control', rest.style)}
      />
    </FieldFrame>
  );
});

import { type InputHTMLAttributes } from 'react';
import { type FieldFrameSlots, type FieldOwnProps } from './Field.js';
import { type ControlPartProps } from './parts.js';
export type TextFieldType = 'text' | 'email' | 'search' | 'url' | 'number' | 'tel' | 'password';
export interface TextFieldSlotProps extends FieldFrameSlots {
    input?: ControlPartProps;
}
export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'prefix'> & FieldOwnProps & {
    type?: TextFieldType;
    slotProps?: TextFieldSlotProps;
};
export declare const TextField: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "prefix"> & FieldOwnProps & {
    type?: TextFieldType;
    slotProps?: TextFieldSlotProps;
} & import("react").RefAttributes<HTMLInputElement>>;

import { type InputHTMLAttributes } from 'react';
import { type FieldOwnProps } from './Field.js';
export type TextFieldType = 'text' | 'email' | 'search' | 'url' | 'number' | 'tel' | 'password';
export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'prefix'> & FieldOwnProps & {
    type?: TextFieldType;
};
export declare const TextField: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "prefix" | "size"> & FieldOwnProps & {
    type?: TextFieldType;
} & import("react").RefAttributes<HTMLInputElement>>;

import { type TextareaHTMLAttributes } from 'react';
import { type FieldOwnProps } from './Field.js';
export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'prefix' | 'rows'> & FieldOwnProps & {
    minRows?: number;
    maxRows?: number;
    /** Show a rolling character count (with maxLength, shows count / max). */
    showCount?: boolean;
};
export declare const TextArea: import("react").ForwardRefExoticComponent<Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix" | "rows"> & FieldOwnProps & {
    minRows?: number;
    maxRows?: number;
    /** Show a rolling character count (with maxLength, shows count / max). */
    showCount?: boolean;
} & import("react").RefAttributes<HTMLTextAreaElement>>;

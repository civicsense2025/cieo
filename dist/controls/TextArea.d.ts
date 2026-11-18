import { type TextareaHTMLAttributes } from 'react';
import { type FieldFrameSlots, type FieldOwnProps } from './Field.js';
import { type ControlPartProps } from './parts.js';
export interface TextAreaSlotProps extends FieldFrameSlots {
    textarea?: ControlPartProps;
    count?: ControlPartProps;
}
export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'prefix' | 'rows'> & FieldOwnProps & {
    minRows?: number;
    maxRows?: number;
    /** Show a rolling character count (with maxLength, shows count / max). */
    showCount?: boolean;
    slotProps?: TextAreaSlotProps;
};
export declare const TextArea: import("react").ForwardRefExoticComponent<Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix" | "rows"> & FieldOwnProps & {
    minRows?: number;
    maxRows?: number;
    /** Show a rolling character count (with maxLength, shows count / max). */
    showCount?: boolean;
    slotProps?: TextAreaSlotProps;
} & import("react").RefAttributes<HTMLTextAreaElement>>;

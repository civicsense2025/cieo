import { type FocusEvent, type FormEvent, type ReactNode } from 'react';
import { type FieldStatus } from './field-state.js';
export type { FieldStatus };
/** Return a message (or false) when the value is invalid; null, undefined or true when it is fine. */
export type Validator = (value: string) => string | boolean | null | undefined;
export interface FieldOwnProps {
    /** Required: names the control, floats above the value. */
    label: ReactNode;
    description?: ReactNode;
    /** An error from the server or the app. Forces the invalid state and shows the message. */
    error?: ReactNode;
    /** Controlled status, overriding the machine. */
    status?: FieldStatus;
    validate?: Validator;
    onStatusChange?: (status: FieldStatus) => void;
    prefix?: ReactNode;
    suffix?: ReactNode;
}
type TextControl = HTMLInputElement | HTMLTextAreaElement;
interface Rules {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number | string;
    max?: number | string;
    type?: string;
}
/** Wires the status machine to a native control and returns the props both halves need. */
export declare function useField<T extends TextControl>(own: FieldOwnProps, rules: Rules, id?: string): {
    ids: {
        control: string;
        desc: string;
        msg: string;
    };
    ref: {
        current: T | null;
    };
    status: FieldStatus;
    message: ReactNode;
    open: boolean;
    control: {
        id: string;
        'aria-invalid': true | undefined;
        'aria-describedby': string | undefined;
        onBlurCapture: (e: FocusEvent<T>) => void;
        onInputCapture: (e: FormEvent<T>) => void;
    };
};
/** The frame around a control: border box, floating label, status icon, description and message. */
export declare function FieldFrame(props: {
    kind: 'input' | 'textarea';
    own: FieldOwnProps;
    field: {
        ids: {
            control: string;
            desc: string;
            msg: string;
        };
        status: FieldStatus;
        message: ReactNode;
        open: boolean;
    };
    floated: boolean;
    className?: string;
    footer?: ReactNode;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

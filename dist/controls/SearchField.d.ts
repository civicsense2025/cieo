import { type InputHTMLAttributes } from 'react';
import { type ControlSize } from './classes.js';
export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    /** Required accessible name. Hidden visually unless showLabel. */
    label: string;
    showLabel?: boolean;
    /** Called with the value on Enter (the form, if any, still submits). */
    onSearch?: (value: string) => void;
    onClear?: () => void;
    clearLabel?: string;
    /** Start as an icon button that expands into the field. Renders expanded until hydrated. */
    collapsible?: boolean;
    size?: ControlSize;
};
export declare const SearchField: import("react").ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
    /** Required accessible name. Hidden visually unless showLabel. */
    label: string;
    showLabel?: boolean;
    /** Called with the value on Enter (the form, if any, still submits). */
    onSearch?: (value: string) => void;
    onClear?: () => void;
    clearLabel?: string;
    /** Start as an icon button that expands into the field. Renders expanded until hydrated. */
    collapsible?: boolean;
    size?: ControlSize;
} & import("react").RefAttributes<HTMLInputElement>>;

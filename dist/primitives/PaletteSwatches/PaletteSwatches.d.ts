import type { PrimitivePartProps } from '../parts.js';
export interface PaletteSwatch {
    /** Value reported to onValueChange and the form. Required. */
    value: string;
    /** Spoken and submitted name (e.g. "Ink #1F201C"). Required. */
    label: string;
    /** Dot fill as CSS color. Required. */
    color: string;
}
export interface PaletteSwatchesProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        swatch?: PrimitivePartProps;
        dot?: PrimitivePartProps;
    };
    /** Accessible name for the group (e.g. "Vector colors"). Required. */
    label: string;
    /** Radio group name for form participation. Required. */
    name: string;
    /** Swatches in row order. Required, at least one. */
    swatches: PaletteSwatch[];
    /** Picked value when controlled. */
    value?: string;
    /** Initial picked value when uncontrolled. */
    defaultValue?: string;
    /** Called with the picked value. Host owns persistence. */
    onValueChange?: (value: string) => void;
    /** Disables every swatch. */
    disabled?: boolean;
    /** Dot size. Defaults to md. */
    size?: 'sm' | 'md';
}
export declare function PaletteSwatches({ className, slotProps, label, name, swatches, value, defaultValue, onValueChange, disabled, size }: PaletteSwatchesProps): import("react/jsx-runtime").JSX.Element;

import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ToggleButtonProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the button; must match the visible text. Required. */
    label: string;
    /** Pressed state when used standalone. Defaults to false; inside a group the group value wins. */
    pressed?: boolean;
    /** Initial pressed state when uncontrolled. Defaults to false. */
    defaultPressed?: boolean;
    /** Group participation key. Only read inside ToggleButtonGroup; ignored standalone. */
    value?: string;
    /** Called with the next pressed state when used standalone. */
    onPressedChange?: (pressed: boolean) => void;
    children: ReactNode;
}
export declare function ToggleButton({ className, slotProps, label, pressed, defaultPressed, value, onPressedChange, children }: ToggleButtonProps): import("react/jsx-runtime").JSX.Element;

import { type ReactNode } from 'react';
export interface ToggleButtonProps {
    /** Accessible name for the button; must match the visible text. Required. */
    label: string;
    /** Pressed state when used standalone. Defaults to false; inside a group the group value wins. */
    pressed?: boolean;
    /** Group participation key. Only read inside ToggleButtonGroup; ignored standalone. */
    value?: string;
    /** Called with the next pressed state when used standalone. */
    onPressedChange?: (pressed: boolean) => void;
    children: ReactNode;
}
export declare function ToggleButton({ label, pressed, value, onPressedChange, children }: ToggleButtonProps): import("react/jsx-runtime").JSX.Element;

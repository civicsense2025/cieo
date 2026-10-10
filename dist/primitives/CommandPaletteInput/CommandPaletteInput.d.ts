export interface CommandPaletteInputProps {
    /** Accessible name for the filter field (e.g. "Filter commands"). Required. */
    label: string;
    /** Controlled filter text. Optional. */
    value?: string;
    /** Host filter hook. Optional. */
    onChange?: (value: string) => void;
    /** Short hint shown when empty. Optional. */
    placeholder?: string;
}
export declare function CommandPaletteInput({ label, value, onChange, placeholder }: CommandPaletteInputProps): import("react/jsx-runtime").JSX.Element;

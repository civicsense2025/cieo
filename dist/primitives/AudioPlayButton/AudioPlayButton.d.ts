/** Accessible name for the button: "Play Voice note" or "Pause Voice note". */
export declare function audioPlayButtonName(playing: boolean, label: string): string;
export interface AudioPlayButtonProps {
    /** True while the clip plays; the button then offers Pause. */
    playing: boolean;
    /** True while the clip is loading; shows a ring and sets aria-busy. */
    loading?: boolean;
    /** Name of the clip, read after Play or Pause (e.g. "Voice note from Ana"). Required. */
    label: string;
    /** Called when the button is pressed (click, Space or Enter). */
    onToggle: () => void;
    /** Button size. Defaults to md. */
    size?: 'sm' | 'md' | 'lg';
}
export declare function AudioPlayButton({ playing, loading, label, onToggle, size }: AudioPlayButtonProps): import("react/jsx-runtime").JSX.Element;

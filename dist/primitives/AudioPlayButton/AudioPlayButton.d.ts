import type { PrimitivePartProps } from '../parts.js';
/** Accessible name for the button: "Play Voice note" or "Pause Voice note". Hosts in other languages
 *  pass their own verbs; the clip's name always follows them. */
export declare function audioPlayButtonName(playing: boolean, label: string, verbs?: {
    play?: string;
    pause?: string;
}): string;
export interface AudioPlayButtonProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        icon?: PrimitivePartProps;
        pauseHalf?: PrimitivePartProps;
        ring?: PrimitivePartProps;
    };
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
    /** The verb read before `label` while paused, in the host's language. Defaults to "Play". */
    playLabel?: string;
    /** The verb read before `label` while playing, in the host's language. Defaults to "Pause". */
    pauseLabel?: string;
}
export declare function AudioPlayButton({ className, slotProps, playing, loading, label, onToggle, size, playLabel, pauseLabel }: AudioPlayButtonProps): import("react/jsx-runtime").JSX.Element;

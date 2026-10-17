import type { RunView } from '../../agent/reduce.js';
export interface RunControlsProps {
    /** The run as the host reported it. */
    run: RunView;
    /** Sends the stop command to the host. Without it no Stop button renders. */
    onStop?: () => void;
    /** True while the stop command is in flight. */
    busy?: boolean;
    /** Stop button text. Defaults to "Stop". */
    stopLabel?: string;
    /** Accessible name for the group. Defaults to "Run controls". */
    label?: string;
    /** Words for the run's status, e.g. a translation. Defaults to the English words. */
    statusLabel?: (status: RunView['status']) => string;
}
export declare function RunControls({ run, onStop, busy, stopLabel, label, statusLabel }: RunControlsProps): import("react/jsx-runtime").JSX.Element;

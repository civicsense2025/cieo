import type { AgentStatus as Status } from '../../agent/event.js';
import { type StatusDotStatus } from '../StatusDot/StatusDot.js';
import type { PrimitivePartProps } from '../parts.js';
/** Dot tone for each reported status. Settled failures read as danger; a plain stop is neutral. */
export declare const AGENT_STATUS_TONES: Readonly<Record<Status, StatusDotStatus>>;
/** Default words for each status. Pass `label` to localize or rephrase. */
export declare const AGENT_STATUS_WORDS: Readonly<Record<Status, string>>;
export interface AgentStatusProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** The status the host reported. Never a guess or an optimistic value. */
    status: Status;
    /** Words shown for the status. Overrides the default words; they must still name the state. */
    label?: string;
    /** Agent or run name shown before the status, e.g. "Researcher". Optional. */
    name?: string;
}
export declare function AgentStatus({ className, slotProps, status, label, name }: AgentStatusProps): import("react/jsx-runtime").JSX.Element;

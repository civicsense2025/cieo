import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
import type { ToolCallView, ToolPhase } from '../../agent/reduce.js';
/** Words for each phase. */
export declare const TOOL_PHASE_WORDS: Readonly<Record<ToolPhase, string>>;
export interface ToolCallDisclosureProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** The tool call as the host reported it. */
    call: ToolCallView;
    /** Extra body content after the summary and error, e.g. arguments or a result preview. Optional. */
    children?: ReactNode;
}
export declare function ToolCallDisclosure({ className, slotProps, call, children }: ToolCallDisclosureProps): import("react/jsx-runtime").JSX.Element;

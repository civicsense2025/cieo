import { type AgentIconDefinition, type AgentIconId } from '../../agent/icons.js';
import type { PrimitivePartProps } from '../parts.js';
export interface AgentIconProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Icon id (e.g. "browsing") or a definition from AGENT_ICONS. */
    icon: AgentIconId | AgentIconDefinition;
    /** Rendered size in pixels. Picks the glyph detail and stroke weight. Defaults to 24. */
    size?: number;
    /** Accessible name. Omit when visible text beside the icon names it. */
    label?: string;
    /** Draw the agent's square outline. Defaults to true. */
    outline?: boolean;
}
export declare function AgentIcon({ className, slotProps, icon, size, label, outline }: AgentIconProps): import("react/jsx-runtime").JSX.Element | null;

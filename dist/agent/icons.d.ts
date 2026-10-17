/** One SVG element: tag, attributes (SVG names), and children for groups. */
export type IconNode = readonly [tag: 'path' | 'circle' | 'ellipse' | 'rect' | 'g', attrs: Readonly<Record<string, string>>, children?: readonly IconNode[]];
export type IconTree = readonly IconNode[];
export type AgentIconGroup = "Doing" | "Talking" | "Waiting" | "Outcome";
export type AgentIconTone = 'success' | 'danger' | 'warning';
export interface AgentIconDefinition {
    /** Stable key, e.g. "browsing". */
    id: string;
    /** Human name, e.g. "Browsing". */
    name: string;
    group: AgentIconGroup;
    /** Status colour the icon carries, or null for the current text colour. */
    tone: AgentIconTone | null;
    /** What the icon's motion shows in the original atom. */
    description: string;
    /** Glyph drawn at 20px and below. */
    compact: IconTree;
    /** Glyph drawn above 20px up to 24px. */
    regular: IconTree;
    /** Glyph drawn above 24px. */
    large: IconTree;
}
export declare const AGENT_ICON_VIEWBOX = "0 0 64 64";
export declare const AGENT_ICON_GROUPS: readonly {
    id: AgentIconGroup;
    hint: string;
}[];
export declare const AGENT_ICONS: readonly AgentIconDefinition[];
export type AgentIconId = "browsing" | "navigating" | "clicking" | "typing" | "scrolling" | "inspecting" | "capturing" | "comparing" | "pinning" | "thinking" | "planning" | "commenting" | "suggesting" | "asking" | "handing" | "taking" | "waiting" | "paused" | "scheduled" | "offline" | "retrying" | "done" | "failed" | "blocked";
/** Looks an icon up by id. Returns undefined for an unknown id. */
export declare function getAgentIcon(id: string): AgentIconDefinition | undefined;
/** The glyph tier for a rendered pixel size. */
export declare function agentIconGlyph(icon: AgentIconDefinition, size: number): IconTree;
/** Rounds to one decimal, as the atom writes every number. */
export declare const roundIconUnit: (value: number) => string;
/** Stroke width in viewBox units that keeps about 1.55px of stroke at any size, never under 1.7 units. Unrounded:
    pass it through roundIconUnit for an attribute. */
export declare function agentIconStrokeWidth(size: number): number;
/** The outline square for an unrounded stroke width, inset so the stroke stays inside the viewBox. */
export declare function agentIconOutline(strokeWidth: number): Readonly<Record<string, string>>;

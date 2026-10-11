export interface OutlineItem {
    id: string;
    label: string;
}
export interface OutlineProps {
    /** Accessible name. Defaults to On this page. */
    label?: string;
    /** Sections to link; each renders an anchor to its id. Required. */
    items: OutlineItem[];
}
export declare function Outline({ label, items }: OutlineProps): import("react/jsx-runtime").JSX.Element;

import type { ReactNode } from 'react';
export interface SelectableCardProps {
    /** Accessible name for the option (e.g. "Monthly billing"). Required. */
    label: string;
    /** Whether the card is selected. Defaults to false. */
    selected?: boolean;
    /** Called when the card is toggled. Optional. */
    onSelect?: () => void;
    children: ReactNode;
}
export declare function SelectableCard({ label, selected, onSelect, children }: SelectableCardProps): import("react/jsx-runtime").JSX.Element;

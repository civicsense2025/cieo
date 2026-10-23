import { type ReactNode } from 'react';
export interface SortableListItemProps {
    /** Stable id matching an entry in the list's order. Required. */
    id: string;
    /** Name used in screen-reader announcements and the handle label. Defaults to the id. */
    label?: string;
    /** Handle content. Defaults to a grip glyph. */
    handle?: ReactNode;
    /** Takes the item out of reordering. Defaults to false. */
    disabled?: boolean;
    /** Row content. For a tbody list, supply the cells. */
    children: ReactNode;
}
export declare function SortableListItem({ id, label, handle, disabled, children }: SortableListItemProps): import("react/jsx-runtime").JSX.Element;

import type { ReactNode } from 'react';
export interface MetadataListItemProps {
    /** Term name (the dt). Required. */
    term: string;
    /** Description content (the dd). Required. */
    children: ReactNode;
}
export declare function MetadataListItem({ term, children }: MetadataListItemProps): import("react/jsx-runtime").JSX.Element;

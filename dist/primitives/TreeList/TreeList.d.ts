import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TreeListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Nesting depth 0-6; drives indent via data-depth selectors. Defaults to 0. */
    depth?: number;
    /** List items; nest deeper TreeLists inside <li> elements. Required. */
    children: ReactNode;
}
export declare function TreeList({ className, slotProps, depth, children }: TreeListProps): import("react/jsx-runtime").JSX.Element;

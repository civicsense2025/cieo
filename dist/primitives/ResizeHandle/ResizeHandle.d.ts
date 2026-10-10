import type * as React from 'react';
export interface ResizeHandleProps {
    /** Separator orientation. Defaults to vertical. */
    orientation?: 'vertical' | 'horizontal';
    /** Accessible name (e.g. "Resize sidebar"). Optional. */
    label?: string;
}
export declare function ResizeHandle({ orientation, label, ...rest }: ResizeHandleProps & React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;

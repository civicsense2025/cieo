import type * as React from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ResizeHandleProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Separator orientation. Defaults to vertical. */
    orientation?: 'vertical' | 'horizontal';
    /** Accessible name (e.g. "Resize sidebar"). Optional. */
    label?: string;
}
export declare function ResizeHandle({ className, slotProps, orientation, label, ...rest }: ResizeHandleProps & React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;

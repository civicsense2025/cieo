import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TokenProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Fill emphasis. Defaults to default. */
    tone?: 'default' | 'accent';
    /** The keyword or filter text. */
    children: ReactNode;
}
export declare function Token({ className, slotProps, tone, children }: TokenProps): import("react/jsx-runtime").JSX.Element;

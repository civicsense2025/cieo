import type { CSSProperties } from 'react';
export interface PrimitivePartProps {
    className?: string;
    style?: CSSProperties;
    title?: string;
    [key: `data-${string}`]: string | number | boolean | undefined;
}

import type { CSSProperties } from 'react';
export interface ControlPartProps {
    className?: string;
    style?: CSSProperties;
    title?: string;
    [key: `data-${string}`]: string | number | boolean | undefined;
}
export declare function customizeControlPart(part: ControlPartProps | undefined, defaultClass?: string, ownedStyle?: CSSProperties, extraClass?: string): ControlPartProps;

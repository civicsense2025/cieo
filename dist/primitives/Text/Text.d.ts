import type { ReactNode } from 'react';
export interface TextProps {
    as?: 'p' | 'span' | 'div';
    size?: 'default' | 'small';
    children: ReactNode;
}
export declare function Text({ as: Tag, size, children }: TextProps): import("react/jsx-runtime").JSX.Element;

import type { ComponentPropsWithRef, ReactNode } from 'react';
export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
    label: string;
    size?: 'sm' | 'md';
    children: ReactNode;
}
export declare function IconButton({ label, size, children, type, className, ...rest }: IconButtonProps): import("react/jsx-runtime").JSX.Element;

import { type CSSProperties, type ReactNode, type RefObject } from 'react';
import type { PrimitivePartProps } from './parts.js';
export declare function useAuthMotionDisabled(element: RefObject<HTMLElement | null>): boolean;
export declare function AuthMotionFrame<T extends string>({ value, children, focus }: {
    value: T;
    children: (value: T, live: boolean) => ReactNode;
    focus?: string | false;
}): import("react/jsx-runtime").JSX.Element;
export declare function AuthSwapText({ value }: {
    value: string | number;
}): import("react/jsx-runtime").JSX.Element;
export declare function AuthMotionMessage({ id, value, className, role }: {
    id?: string;
    value?: string;
    className: string;
    role?: 'alert' | 'status';
}): import("react/jsx-runtime").JSX.Element;
export interface AuthCardSlotProps {
    root?: PrimitivePartProps;
    title?: PrimitivePartProps;
    footer?: PrimitivePartProps;
}
export interface AuthCardSlots {
    beforeForm?: ReactNode;
    afterForm?: ReactNode;
    footer?: ReactNode;
}
export declare function AuthCardShell({ id, title, status, style, children, footer, className, slotProps, slots }: {
    className?: string;
    slotProps?: AuthCardSlotProps;
    slots?: AuthCardSlots;
    id: string;
    title: string;
    status?: string;
    style?: CSSProperties;
    children: ReactNode;
    footer?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;

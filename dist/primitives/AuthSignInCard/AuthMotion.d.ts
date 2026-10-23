import { type ReactNode, type RefObject } from 'react';
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

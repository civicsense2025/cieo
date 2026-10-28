import type { PrimitivePartProps } from '../parts.js';
import type { CSSProperties, ReactNode } from 'react';
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
export interface AuthSignInCardProps {
    className?: string;
    slotProps?: AuthCardSlotProps;
    slots?: AuthCardSlots;
    id: string;
    title?: string;
    pending?: boolean;
    error?: string;
    status?: string;
    magicLinkHref?: string;
    resetHref?: string;
    signupHref?: string;
    style?: CSSProperties;
    onSubmit: (values: {
        email: string;
        password: string;
    }) => void;
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
export declare function AuthSignInCard({ id, title, pending, error, status, magicLinkHref, resetHref, signupHref, style, onSubmit, className, slotProps, slots }: AuthSignInCardProps): import("react/jsx-runtime").JSX.Element;

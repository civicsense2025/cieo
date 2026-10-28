import type { CSSProperties } from 'react';
import { type AuthCardSlotProps, type AuthCardSlots } from '../AuthSignInCard/AuthSignInCard.js';
export interface AuthResetFlowProps {
    className?: string;
    slotProps?: AuthCardSlotProps;
    slots?: AuthCardSlots;
    id: string;
    title?: string;
    step: 'request' | 'confirm';
    pending?: boolean;
    error?: string;
    status?: string;
    signinHref?: string;
    style?: CSSProperties;
    onRequest: (email: string) => void;
    onConfirm: (password: string) => void;
}
export declare function AuthResetFlow({ id, title, step, pending, error, status, signinHref, style, onRequest, onConfirm, className, slotProps, slots }: AuthResetFlowProps): import("react/jsx-runtime").JSX.Element;

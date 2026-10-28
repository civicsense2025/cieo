import type { CSSProperties } from 'react';
import { type AuthCardSlotProps, type AuthCardSlots } from '../AuthSignInCard/AuthSignInCard.js';
export interface AuthMfaFlowProps {
    className?: string;
    slotProps?: AuthCardSlotProps;
    slots?: AuthCardSlots;
    id: string;
    title?: string;
    pending?: boolean;
    error?: string;
    status?: string;
    resendIn?: number;
    style?: CSSProperties;
    onSubmit: (code: string) => void;
    onRecovery: (code: string) => void;
    onResend?: () => void;
}
export declare function AuthMfaFlow({ id, title, pending, error, status, resendIn, style, onSubmit, onRecovery, onResend, className, slotProps, slots }: AuthMfaFlowProps): import("react/jsx-runtime").JSX.Element;

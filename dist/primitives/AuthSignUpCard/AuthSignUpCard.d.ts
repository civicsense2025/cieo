import type { CSSProperties } from 'react';
import { type AuthCardSlotProps, type AuthCardSlots } from '../AuthSignInCard/AuthSignInCard.js';
export interface AuthSignUpCardProps {
    className?: string;
    slotProps?: AuthCardSlotProps;
    slots?: AuthCardSlots;
    id: string;
    title?: string;
    pending?: boolean;
    error?: string;
    status?: string;
    signinHref?: string;
    style?: CSSProperties;
    onSubmit: (values: {
        email: string;
        password: string;
    }) => void;
}
export declare function AuthSignUpCard({ id, title, pending, error, status, signinHref, style, onSubmit, className, slotProps, slots }: AuthSignUpCardProps): import("react/jsx-runtime").JSX.Element;

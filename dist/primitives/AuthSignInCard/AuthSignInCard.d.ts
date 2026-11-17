import type { CSSProperties } from 'react';
import { type AuthCardSlotProps, type AuthCardSlots } from '../auth-shared.js';
export { AuthCardShell, type AuthCardSlotProps, type AuthCardSlots } from '../auth-shared.js';
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
export declare function AuthSignInCard({ id, title, pending, error, status, magicLinkHref, resetHref, signupHref, style, onSubmit, className, slotProps, slots }: AuthSignInCardProps): import("react/jsx-runtime").JSX.Element;

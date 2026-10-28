import type { PrimitivePartProps } from '../parts.js';
import type { CSSProperties } from 'react';
export interface AuthAccountCardProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
        profile?: PrimitivePartProps;
        avatar?: PrimitivePartProps;
        identity?: PrimitivePartProps;
        name?: PrimitivePartProps;
        email?: PrimitivePartProps;
        confirmation?: PrimitivePartProps;
        actions?: PrimitivePartProps;
        confirm?: PrimitivePartProps;
        cancel?: PrimitivePartProps;
        signOut?: PrimitivePartProps;
    };
    id: string;
    name: string;
    email: string;
    avatarInitials: string;
    signOutConfirm?: boolean;
    style?: CSSProperties;
    onSignOut: () => void;
}
export declare function AuthAccountCard({ id, name, email, avatarInitials, signOutConfirm, style, onSignOut, className, slotProps }: AuthAccountCardProps): import("react/jsx-runtime").JSX.Element;

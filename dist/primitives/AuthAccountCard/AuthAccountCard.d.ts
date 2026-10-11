import type { CSSProperties } from 'react';
export interface AuthAccountCardProps {
    id: string;
    name: string;
    email: string;
    avatarInitials: string;
    signOutConfirm?: boolean;
    style?: CSSProperties;
    onSignOut: () => void;
}
export declare function AuthAccountCard({ id, name, email, avatarInitials, signOutConfirm, style, onSignOut }: AuthAccountCardProps): import("react/jsx-runtime").JSX.Element;

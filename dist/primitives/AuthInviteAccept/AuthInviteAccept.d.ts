import type { PrimitivePartProps } from '../parts.js';
import type { CSSProperties } from 'react';
export interface AuthInviteAcceptProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        cardTitle?: PrimitivePartProps;
        inviteText?: PrimitivePartProps;
        inviteActions?: PrimitivePartProps;
        accept?: PrimitivePartProps;
        decline?: PrimitivePartProps;
    };
    id: string;
    orgName: string;
    inviterName: string;
    role: string;
    pending?: boolean;
    error?: string;
    style?: CSSProperties;
    onAccept: () => void;
    onDecline: () => void;
}
export declare function AuthInviteAccept({ className, slotProps, id, orgName, inviterName, role, pending, error, style, onAccept, onDecline }: AuthInviteAcceptProps): import("react/jsx-runtime").JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
import type { CSSProperties } from 'react';
export interface AuthSsoProvider {
    id: string;
    label: string;
}
export interface AuthSsoButtonsProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        ssoButton?: PrimitivePartProps;
    };
    id: string;
    providers: AuthSsoProvider[];
    /** Id of the provider with a redirect in flight. */
    pendingId?: string;
    style?: CSSProperties;
    onPress?: (id: string) => void;
}
export declare function AuthSsoButtons({ className, slotProps, id, providers, pendingId, style, onPress }: AuthSsoButtonsProps): import("react/jsx-runtime").JSX.Element;

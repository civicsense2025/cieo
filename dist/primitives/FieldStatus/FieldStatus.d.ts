import type { PrimitivePartProps } from '../parts.js';
export interface FieldStatusProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** The help or error text. Required. */
    message: string;
    /** Help tone renders plain text; error tone announces via role=alert. Defaults to description. */
    tone?: 'description' | 'error';
}
export declare function FieldStatus({ className, slotProps, message, tone }: FieldStatusProps): import("react/jsx-runtime").JSX.Element;

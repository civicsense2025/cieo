export interface FieldStatusProps {
    /** The help or error text. Required. */
    message: string;
    /** Help tone renders plain text; error tone announces via role=alert. Defaults to description. */
    tone?: 'description' | 'error';
}
export declare function FieldStatus({ message, tone }: FieldStatusProps): import("react/jsx-runtime").JSX.Element;

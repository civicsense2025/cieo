import type { ReactNode } from 'react';
export interface FieldProps {
    label: string;
    htmlFor?: string;
    description?: string;
    error?: string;
    children: ReactNode;
}
export declare function Field({ label, htmlFor, description, error, children }: FieldProps): import("react/jsx-runtime").JSX.Element;

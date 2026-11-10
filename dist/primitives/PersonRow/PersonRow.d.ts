import type { PrimitivePartProps } from '../parts.js';
export interface PersonRowProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    name: string;
    detail?: string;
    src?: string;
    ring?: string;
    compact?: boolean;
    grayscale?: boolean;
}
export declare function PersonRow({ className, slotProps, name, detail, src, ring, compact, grayscale }: PersonRowProps): import("react/jsx-runtime").JSX.Element;

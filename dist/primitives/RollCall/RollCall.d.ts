import type { PrimitivePartProps } from '../parts.js';
export interface RollCallMember {
    id: string;
    name: string;
    detail?: string;
    src?: string;
}
export interface RollCallGroup {
    id: string;
    title: string;
    color: string;
    members: RollCallMember[];
}
export interface RollCallProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    groups: RollCallGroup[];
    /** 1 to 4 columns; out-of-range values clamp. */
    columns?: number;
}
export declare function rollColumns(n: number): number;
export declare function RollCall({ className, slotProps, groups, columns }: RollCallProps): import("react/jsx-runtime").JSX.Element;

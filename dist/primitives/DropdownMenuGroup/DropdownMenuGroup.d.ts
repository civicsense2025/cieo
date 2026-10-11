import type { ReactNode } from 'react';
export interface DropdownMenuGroupProps {
    /** Section name announced with the group. Optional; omit for unlabeled clusters. */
    label?: string;
    children: ReactNode;
}
export declare function DropdownMenuGroup({ label, children }: DropdownMenuGroupProps): import("react/jsx-runtime").JSX.Element;

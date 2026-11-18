import { type JSX, type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CollapsibleGroupContextValue {
    isOpen: (itemValue: string) => boolean;
    toggleItem: (itemValue: string) => void;
}
export declare const CollapsibleGroupContext: import("react").Context<CollapsibleGroupContextValue | null>;
export interface CollapsibleGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group. Required. */
    label: string;
    /** Allow multiple items open simultaneously. Defaults to false when coordinating by value. */
    multiple?: boolean;
    /** Optional Radix-style mode alias ('single' | 'multiple'). */
    type?: 'single' | 'multiple';
    /** In single mode, whether pressing the open item collapses it. Defaults to true. */
    collapsible?: boolean;
    /** Controlled open item key (single) or keys (multiple). */
    value?: string | readonly string[];
    /** Initial open item key (single) or keys (multiple) when uncontrolled. */
    defaultValue?: string | readonly string[];
    /** Called with the next open key (single) or keys array (multiple). */
    onValueChange?: ((value: string) => void) | ((value: string[]) => void);
    /** Collapsible children. Required. */
    children: ReactNode;
}
export declare function CollapsibleGroup(props: CollapsibleGroupProps & {
    multiple: true;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
}): JSX.Element;
export declare function CollapsibleGroup(props: CollapsibleGroupProps & {
    multiple?: false;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}): JSX.Element;

import type { PrimitivePartProps } from '../parts.js';
export interface PaginationProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Current page (1-based). Required. */
    page: number;
    /** Total page count. Required. */
    pageCount: number;
    /** Page change handler. */
    onPageChange?: (page: number) => void;
    /** Accessible name. Defaults to Pagination. */
    label?: string;
    /** False renders the current numeral instantly. Defaults to true (numeral rolls on change). */
    motion?: boolean;
}
export declare function Pagination({ className, slotProps, page, pageCount, onPageChange, label, motion }: PaginationProps): import("react/jsx-runtime").JSX.Element;

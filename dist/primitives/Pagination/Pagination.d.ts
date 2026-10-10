export interface PaginationProps {
    /** Current page (1-based). Required. */
    page: number;
    /** Total page count. Required. */
    pageCount: number;
    /** Page change handler. */
    onPageChange?: (page: number) => void;
    /** Accessible name. Defaults to Pagination. */
    label?: string;
}
export declare function Pagination({ page, pageCount, onPageChange, label }: PaginationProps): import("react/jsx-runtime").JSX.Element;

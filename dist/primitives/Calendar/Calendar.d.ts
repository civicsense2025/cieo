import type { PrimitivePartProps } from '../parts.js';
export interface CalendarProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        weekday?: PrimitivePartProps;
        blank?: PrimitivePartProps;
        day?: PrimitivePartProps;
    };
    /** Full year (e.g. 2026). Required. */
    year: number;
    /** Month of year, 1-12. Required. */
    month: number;
    /** Selected day as an ISO date (YYYY-MM-DD). Optional. */
    selected?: string;
    /** Called with the ISO date when a day is picked. Optional. */
    onSelect?: (iso: string) => void;
}
export declare function Calendar({ className, slotProps, year, month, selected, onSelect }: CalendarProps): import("react/jsx-runtime").JSX.Element;

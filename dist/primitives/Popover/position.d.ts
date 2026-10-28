export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';
export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface PopoverPositionOptions {
    side?: PopoverSide;
    align?: PopoverAlign;
    offset?: number;
    padding?: number;
    rtl?: boolean;
}
export declare function popoverPosition(anchor: Rect, panel: Pick<Rect, 'width' | 'height'>, viewport: Rect, options?: PopoverPositionOptions): {
    x: number;
    y: number;
    side: PopoverSide;
    maxWidth: number;
    maxHeight: number;
};

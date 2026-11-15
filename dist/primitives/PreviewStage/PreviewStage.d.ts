import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export type PreviewBackdrop = 'checker' | 'light' | 'dark';
export interface PreviewStageProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        viewport?: PrimitivePartProps;
        media?: PrimitivePartProps;
        toolbar?: PrimitivePartProps;
        zoom?: PrimitivePartProps;
    };
    /** Accessible name for the preview region (e.g. "Vector result"). Required. */
    label: string;
    /** Backdrop behind transparent artwork. Defaults to checker. */
    backdrop?: PreviewBackdrop;
    /** Called with the picked backdrop. Omit to hide the backdrop switch. */
    onBackdropChange?: (backdrop: PreviewBackdrop) => void;
    /** Accessible name for the backdrop switch. Defaults to Preview backdrop. */
    backdropLabel?: string;
    /** Visible names for the three backdrops. Defaults to English. */
    backdropNames?: {
        checker?: string;
        light?: string;
        dark?: string;
    };
    /** Zoom factor, 1 = 100%. Host owns the value. */
    zoom?: number;
    /** Called with the new zoom. Omit to hide zoom controls. */
    onZoomChange?: (zoom: number) => void;
    /** Zoom step for the toolbar buttons. Defaults to 0.25. */
    zoomStep?: number;
    /** Maximum toolbar zoom. Defaults to 8. */
    maxZoom?: number;
    /** Whether the media fits the viewport. Host owns the value. */
    fitted?: boolean;
    /** Called with the new fit state. Omit to hide the fit toggle. */
    onFitChange?: (fitted: boolean) => void;
    zoomInLabel?: string;
    zoomOutLabel?: string;
    zoomResetLabel?: string;
    fitLabel?: string;
    /** Media to stage. Required. */
    children: ReactNode;
    /** Dimensions or status line under the toolbar. */
    caption?: ReactNode;
}
export declare function PreviewStage({ className, slotProps, label, backdrop, onBackdropChange, backdropLabel, backdropNames, zoom, onZoomChange, zoomStep, maxZoom, fitted, onFitChange, zoomInLabel, zoomOutLabel, zoomResetLabel, fitLabel, children, caption, motion, entering, exiting }: PreviewStageProps): import("react/jsx-runtime").JSX.Element;

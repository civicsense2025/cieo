export interface LightboxProps {
    /** Image source. Required. */
    src: string;
    /** Image alternative text. Required. */
    alt: string;
    /** Whether the viewer is open. Renders null when false or omitted. */
    open?: boolean;
    /** Called on Escape or host close affordances. Optional. */
    onClose?: () => void;
    /** Accessible name for the viewer dialog. Defaults to Image viewer. */
    label?: string;
}
export declare function Lightbox({ src, alt, open, onClose, label }: LightboxProps): import("react/jsx-runtime").JSX.Element | null;

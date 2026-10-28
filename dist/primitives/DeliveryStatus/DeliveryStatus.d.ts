import type { PrimitivePartProps } from '../parts.js';
export type DeliveryState = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
/** Word for a delivery state, read aloud and shown for failures. */
export declare function deliveryLabel(status: DeliveryState): string;
export interface DeliveryStatusProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        icon?: PrimitivePartProps;
        glyph?: PrimitivePartProps;
        text?: PrimitivePartProps;
        time?: PrimitivePartProps;
    };
    /** Where the message is. Required. */
    status: DeliveryState;
    /** Optional time text shown beside the icon (for example "9:41 AM"). Read after the status. */
    time?: string;
}
export declare function DeliveryStatus({ className, slotProps, status, time }: DeliveryStatusProps): import("react/jsx-runtime").JSX.Element;

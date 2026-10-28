import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type SpeakerRole } from '../SpeakerTile/SpeakerTile.js';
export interface AudioRoomSpeaker {
    /** Stable id; the stage animates by it when people join, leave or move. */
    id: string;
    /** Display name. */
    name: string;
    /** Avatar node (usually an Avatar). */
    avatar: ReactNode;
    /** Live loudness, 0 to 1. */
    level?: number;
    /** Shows the muted badge. */
    muted?: boolean;
    /** Role in the room. */
    role?: SpeakerRole;
    /** Shows the raised-hand badge. */
    handRaised?: boolean;
}
export interface AudioRoomSelf {
    /** Whether the person's own microphone is muted. */
    muted: boolean;
    /** Whether the person's hand is up. */
    handRaised: boolean;
    /** Only people who may speak get a mute button. */
    canSpeak: boolean;
}
/** Stage order key: changes when someone joins, leaves or moves, so the stage knows to animate. */
export declare function stageKey(speakers: readonly {
    id: string;
}[]): string;
export interface AudioRoomProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        header?: PrimitivePartProps;
        title?: PrimitivePartProps;
        listeners?: PrimitivePartProps;
        count?: PrimitivePartProps;
        stage?: PrimitivePartProps;
        speaker?: PrimitivePartProps;
        controls?: PrimitivePartProps;
        control?: PrimitivePartProps;
        reactions?: PrimitivePartProps;
    };
    /** Room title; also the accessible name of the region. */
    title: string;
    /** People on stage, in display order. */
    speakers: AudioRoomSpeaker[];
    /** How many people are listening. Shown in short form with the exact number read aloud. */
    listenerCount: number;
    /** Optional listener faces (for example an AvatarGroup) beside the count. */
    listeners?: ReactNode;
    /** The person's own state. */
    self: AudioRoomSelf;
    /** Called when the mute button is pressed. */
    onToggleMute: () => void;
    /** Called when the raise-hand button is pressed. */
    onToggleHand: () => void;
    /** Called when Leave is pressed. */
    onLeave: () => void;
    /** Slot for a reaction picker or buttons, placed in the control bar. */
    reactions?: ReactNode;
}
export declare function AudioRoom({ title, speakers, listenerCount, listeners, self, onToggleMute, onToggleHand, onLeave, reactions, className, slotProps }: AudioRoomProps): import("react/jsx-runtime").JSX.Element;

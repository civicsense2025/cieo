import { type ReactNode } from 'react';
export type SpeakerRole = 'host' | 'speaker' | 'listener';
/** Speaking threshold with hysteresis so the ring does not flicker: on above 0.12, off below 0.06, otherwise unchanged. */
export declare function speakingStep(prev: boolean, level: number): boolean;
/** Screen-reader sentence for a tile: "Ava, host, speaking" or "Ben, muted, hand raised". Muted people are never described as speaking. */
export declare function speakerLabel(o: {
    name: string;
    role?: SpeakerRole;
    muted?: boolean;
    speaking?: boolean;
    handRaised?: boolean;
}): string;
export interface SpeakerTileProps {
    /** Display name, shown under the avatar and read aloud. */
    name: string;
    /** Avatar node (usually an Avatar). Hidden from assistive tech; the tile's own text names the person. */
    avatar: ReactNode;
    /** Live loudness, 0 to 1. The ring follows it on a spring. */
    level?: number;
    /** Shows a muted badge and keeps the ring still. */
    muted?: boolean;
    /** Role in the room; read aloud and exposed as data-role. */
    role?: SpeakerRole;
    /** Shows a raised-hand badge. */
    handRaised?: boolean;
    /** Tile size. Defaults to md. */
    size?: 'sm' | 'md' | 'lg';
}
export declare function SpeakerTile({ name, avatar, level, muted, role, handRaised, size }: SpeakerTileProps): import("react/jsx-runtime").JSX.Element;

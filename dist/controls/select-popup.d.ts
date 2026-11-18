import { Track } from '../core/spring.js';
export declare function resolveOptionNodes(box: HTMLDivElement | null, cached: HTMLElement[], open: boolean): HTMLElement[];
export declare const optionGap: (n: number) => number;
export declare function paintLiveOptions(holder: {
    current: HTMLElement[];
}, lastQ: Map<HTMLElement, number>, qFor: (index: number) => number): void;
export interface SelectPresenceState {
    o: Track;
    t0: number;
    stop: (() => void) | null;
}
export declare function syncSelectPopup(params: {
    pop: HTMLDivElement | null;
    list: HTMLDivElement | null;
    trigger: HTMLButtonElement | null;
    open: boolean;
    side: 'bottom' | 'top';
    presence: SelectPresenceState;
    optionCache: {
        current: HTMLElement[];
    };
}): void;
export interface SelectPlateState {
    top: Track;
    bottom: Track;
    stop: (() => void) | null;
    shown: boolean;
}
export declare function syncSelectPlate(params: {
    plate: HTMLDivElement | null;
    list: HTMLDivElement | null;
    activeId: string;
    open: boolean;
    keyboard: boolean;
    edges: SelectPlateState;
}): void;

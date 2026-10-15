import { type SpringConfig } from '../core/spring.js';
export declare class Driver {
    private paint;
    private settled?;
    private tr;
    private stop;
    private last;
    constructor(initial: number, paint: (v: number) => void, settled?: ((v: number) => void) | undefined);
    get value(): number;
    get target(): number;
    to(v: number, opts?: {
        cfg?: SpringConfig;
        jump?: boolean;
        el?: Element | null;
    }): void;
    cancel(): void;
}
export declare const px: (v: number) => string;

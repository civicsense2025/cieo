import { type MachineStore, type TransitionEnvelope } from './types.js';
export type FieldValidationStatus = 'idle' | 'valid' | 'invalid';
export interface FieldValidationState {
    readonly status: FieldValidationStatus;
    readonly value: string;
    readonly message: string;
    readonly open: boolean;
}
export type FieldValidationEvent = {
    readonly type: 'INPUT';
    readonly value: string;
} | {
    readonly type: 'BLUR';
} | {
    readonly type: 'RESET';
};
export interface FieldValidationOptions {
    readonly validate: (value: string) => string | null;
}
export declare function createInitialFieldValidationState(): FieldValidationState;
export declare function reduceFieldValidation(state: FieldValidationState, event: FieldValidationEvent, validate: (value: string) => string | null): TransitionEnvelope<FieldValidationState, FieldValidationEvent>;
export declare function createFieldValidationMachine(options: FieldValidationOptions): MachineStore<FieldValidationState, FieldValidationEvent>;

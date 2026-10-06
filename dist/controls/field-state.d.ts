export type FieldStatus = 'neutral' | 'valid' | 'invalid';
/** 'invalid' is the native event a form fires on each failing control when a submit is attempted. */
export type FieldEvent = 'input' | 'blur' | 'reset' | 'invalid';
export interface FieldReading {
    /** The value is empty. */
    empty: boolean;
    /** The value passes native constraints and the custom validator. */
    valid: boolean;
    /** The field has any rule to pass (required, pattern, type=email, validate...). Without one it never shows valid. */
    checks: boolean;
}
export declare function nextFieldStatus(prev: FieldStatus, event: FieldEvent, r: FieldReading): FieldStatus;
/** The status on screen: a controlled `status` wins, then an `error` from the server or the app, then the machine. */
export declare function resolveFieldStatus(machine: FieldStatus, opts: {
    status?: FieldStatus;
    error?: unknown;
}): FieldStatus;

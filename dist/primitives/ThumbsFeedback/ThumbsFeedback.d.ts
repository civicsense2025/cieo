export type ThumbValue = 'up' | 'down';
export type ThumbsStep = 'ask' | 'detail' | 'done';
export interface ThumbsState {
    step: ThumbsStep;
    value: ThumbValue | null;
}
export type ThumbsEvent = {
    type: 'rate';
    value: ThumbValue;
    hasReasons: boolean;
} | {
    type: 'submit';
} | {
    type: 'skip';
};
export declare const THUMBS_INITIAL: ThumbsState;
/** Pure step machine. ask -> detail (or straight to done when that thumb has no reasons) -> done. Changing the thumb while in detail keeps the step. done is final. */
export declare function thumbsStep(state: ThumbsState, event: ThumbsEvent): ThumbsState;
export interface ThumbsResult {
    value: ThumbValue;
    reasons: string[];
    comment: string;
}
export interface ThumbsFeedbackProps {
    /** The question. Defaults to "Was this helpful?". */
    question?: string;
    /** Called as soon as a thumb is pressed, before any detail. */
    onRate?: (value: ThumbValue) => void;
    /** Reason chips offered after each thumb. Omit or leave a list empty to skip the detail step for that thumb. */
    reasons?: {
        up: readonly string[];
        down: readonly string[];
    };
    /** Called once with the final result: from Submit, from Skip (no reasons, empty comment), or straight after the thumb when that thumb has no reasons. */
    onSubmit(result: ThumbsResult): void;
    /** Thank-you text. Defaults to "Thanks for the feedback." */
    thanks?: string;
}
export declare function ThumbsFeedback({ question, onRate, reasons, onSubmit, thanks }: ThumbsFeedbackProps): import("react/jsx-runtime").JSX.Element;

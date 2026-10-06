export interface FormLike {
    requestSubmit?: () => void;
    submit: () => void;
}
export interface NativeLike extends EventTarget {
    value: string;
    form?: FormLike | null;
}
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export declare const normalizeOptions: (options: ReadonlyArray<SelectOption | string>) => SelectOption[];
/** Index of `value`, or the first enabled option as a native select would show, or -1 when empty. */
export declare function indexOfValue(options: readonly SelectOption[], value: string | undefined): number;
/** Writes through the element's own prototype setter (frameworks track the instance setter) and fires input then
    change, bubbling, like a user pick. Returns false and fires nothing when the value is already current. */
export declare function setNativeValue(el: NativeLike, value: string): boolean;
/** Submits the element's form as a submit button would (validation and submit listeners included). */
export declare function submitOwner(el: {
    form?: FormLike | null;
}): boolean;

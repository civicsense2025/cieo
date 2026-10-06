/* The native form element stays the source of truth: these helpers write its value the way a user would
   (so frameworks and form listeners see a real change event) and submit its form. Typed against small
   interfaces so tests can use a plain EventTarget. */

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

export const normalizeOptions = (options: ReadonlyArray<SelectOption | string>): SelectOption[] =>
  options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

/** Index of `value`, or the first enabled option as a native select would show, or -1 when empty. */
export function indexOfValue(options: readonly SelectOption[], value: string | undefined): number {
  const i = value === undefined ? -1 : options.findIndex((o) => o.value === value);
  return i >= 0 ? i : options.findIndex((o) => !o.disabled);
}

/** Writes through the element's own prototype setter (frameworks track the instance setter) and fires input then
    change, bubbling, like a user pick. Returns false and fires nothing when the value is already current. */
export function setNativeValue(el: NativeLike, value: string): boolean {
  if (el.value === value) return false;
  const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
  if (desc?.set) desc.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/** Submits the element's form as a submit button would (validation and submit listeners included). */
export function submitOwner(el: { form?: FormLike | null }): boolean {
  const form = el.form;
  if (!form) return false;
  if (typeof form.requestSubmit === 'function') form.requestSubmit();
  else form.submit();
  return true;
}

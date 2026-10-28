const selector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[contenteditable="true"],[tabindex]';

function isTabStop(element: HTMLElement): boolean {
  return (element.tabIndex >= 0 || !element.hasAttribute('tabindex') && element.isContentEditable) && !element.matches(':disabled,[aria-disabled="true"]') && element.getClientRects().length > 0
    && !element.closest('[inert],[aria-hidden="true"]') && getComputedStyle(element).visibility === 'visible';
}

export function popoverStops(root: ParentNode): HTMLElement[] {
  const stops = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(isTabStop);
  const radioTrees = new Map<Node, Set<HTMLInputElement>>();
  return stops.filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name) return true;
    const tree = element.getRootNode();
    if (!radioTrees.has(tree)) {
      const groups = new Map<HTMLFormElement | null, Map<string, HTMLInputElement[]>>();
      for (const radio of (tree as ParentNode).querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
        if (!radio.name || !isTabStop(radio)) continue;
        if (!groups.has(radio.form)) groups.set(radio.form, new Map());
        const names = groups.get(radio.form)!;
        if (!names.has(radio.name)) names.set(radio.name, []);
        names.get(radio.name)!.push(radio);
      }
      const selected = new Set<HTMLInputElement>();
      for (const names of groups.values()) for (const radios of names.values()) {
        selected.add(radios.find((radio) => radio.checked) ?? radios.find((radio) => radio === radio.ownerDocument.activeElement) ?? radios[0]);
      }
      radioTrees.set(tree, selected);
    }
    return radioTrees.get(tree)!.has(element);
  });
}

export function focusPopover(panel: HTMLElement | null): void {
  if (panel) (popoverStops(panel)[0] ?? panel.querySelector<HTMLElement>('[role="dialog"]'))?.focus();
}

export function leavePopover(panel: HTMLElement, trigger: HTMLElement | null, backward: boolean): void {
  if (!trigger) return;
  const stops = popoverStops(document);
  const next = stops.slice(stops.indexOf(trigger) + 1).find((element) => !panel.contains(element));
  (backward ? trigger : next ?? trigger).focus();
}

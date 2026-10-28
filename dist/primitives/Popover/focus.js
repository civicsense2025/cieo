const selector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[contenteditable="true"],[tabindex]';
export function popoverStops(root) {
    return Array.from(root.querySelectorAll(selector)).filter((element) => (element.tabIndex >= 0 || !element.hasAttribute('tabindex') && element.isContentEditable) && !element.matches(':disabled,[aria-disabled="true"]') && element.getClientRects().length > 0
        && !element.closest('[inert],[aria-hidden="true"]') && getComputedStyle(element).visibility === 'visible');
}
export function focusPopover(panel) {
    if (panel)
        (popoverStops(panel)[0] ?? panel.querySelector('[role="dialog"]'))?.focus();
}
export function leavePopover(panel, trigger, backward) {
    if (!trigger)
        return;
    const stops = popoverStops(document);
    const next = stops.slice(stops.indexOf(trigger) + 1).find((element) => !panel.contains(element));
    (backward ? trigger : next ?? trigger).focus();
}

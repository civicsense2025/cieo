const selector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[contenteditable="true"],[tabindex]';
function isTabStop(element) {
    return (element.tabIndex >= 0 || !element.hasAttribute('tabindex') && element.isContentEditable) && !element.matches(':disabled,[aria-disabled="true"]') && element.getClientRects().length > 0
        && !element.closest('[inert],[aria-hidden="true"]') && getComputedStyle(element).visibility === 'visible';
}
export function popoverStops(root) {
    const stops = Array.from(root.querySelectorAll(selector)).filter(isTabStop);
    const radioTrees = new Map();
    return stops.filter((element) => {
        if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name)
            return true;
        const tree = element.getRootNode();
        if (!radioTrees.has(tree)) {
            const groups = new Map();
            for (const radio of tree.querySelectorAll('input[type="radio"]')) {
                if (!radio.name || !isTabStop(radio))
                    continue;
                if (!groups.has(radio.form))
                    groups.set(radio.form, new Map());
                const names = groups.get(radio.form);
                if (!names.has(radio.name))
                    names.set(radio.name, []);
                names.get(radio.name).push(radio);
            }
            const selected = new Set();
            for (const names of groups.values())
                for (const radios of names.values()) {
                    selected.add(radios.find((radio) => radio.checked) ?? radios.find((radio) => radio === radio.ownerDocument.activeElement) ?? radios[0]);
                }
            radioTrees.set(tree, selected);
        }
        return radioTrees.get(tree).has(element);
    });
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

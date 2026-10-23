// src/primitives/ReactionSummary/ReactionSummary.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* ReactionSummary. Chips under a message or comment showing who reacted with what. The host owns the list; toggleReaction computes the next one. */
import { useEffect, useRef, useState } from 'react';
import { useFlip } from '../../react/index.js';
import { CompactCount } from '../CompactCount/CompactCount.js';
import { Popover } from '../Popover/Popover.js';
import { DEFAULT_REACTIONS, ReactionPicker } from '../ReactionPicker/ReactionPicker.js';
/** Next list after the current person toggles `id`. Off decrements and drops the chip at 0; on increments, or appends a new chip (count 1, mine). Never mutates. */
export function toggleReaction(list, id, emoji, label) {
    const at = list.findIndex((r) => r.id === id);
    if (at < 0)
        return [...list, { id, emoji: emoji ?? id, label: label ?? id, count: 1, mine: true }];
    const r = list[at];
    if (r.mine) {
        const count = Math.max(0, r.count - 1);
        if (count === 0)
            return list.filter((_, i) => i !== at);
        return list.map((x, i) => (i === at ? { ...x, count, mine: false } : x));
    }
    return list.map((x, i) => (i === at ? { ...x, count: x.count + 1, mine: true } : x));
}
/** Accessible name of a chip: "Love, 3 people including you". */
export function reactionName(r) {
    const count = Math.max(0, Math.floor(Number.isFinite(r.count) ? r.count : 0));
    if (r.mine && count <= 1)
        return `${r.label}, just you`;
    const people = `${count} ${count === 1 ? 'person' : 'people'}`;
    return `${r.label}, ${people}${r.mine ? ' including you' : ''}`;
}
const SETTLE_MS = 400;
/** Which ids are new since the last list, and which chips just left (with their old index). Pure so it can be tested. */
export function reactionDiff(prev, next) {
    const had = new Set(prev.map((r) => r.id));
    const has = new Set(next.map((r) => r.id));
    return {
        entering: next.filter((r) => !had.has(r.id)).map((r) => r.id),
        leaving: prev.flatMap((chip, at) => (has.has(chip.id) ? [] : [{ at, chip }])),
    };
}
export function ReactionSummary({ reactions, onToggle, onAdd, available = DEFAULT_REACTIONS }) {
    const rootRef = useRef(null);
    const listRef = useRef(null);
    const prev = useRef(reactions);
    const [entering, setEntering] = useState([]);
    const [leaving, setLeaving] = useState([]);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const diff = reactionDiff(prev.current, reactions);
        prev.current = reactions;
        if (!diff.entering.length && !diff.leaving.length)
            return;
        setEntering(diff.entering);
        setLeaving(diff.leaving);
        const id = setTimeout(() => {
            setEntering([]);
            setLeaving([]);
        }, SETTLE_MS);
        return () => clearTimeout(id);
    }, [reactions]);
    const shown = reactions.map((chip) => ({ chip, gone: false }));
    for (const l of leaving)
        shown.splice(Math.min(l.at, shown.length), 0, { chip: l.chip, gone: true });
    useFlip(listRef, shown.map((s) => s.chip.id).join('|'));
    const mine = reactions.filter((r) => r.mine).map((r) => r.id);
    return (_jsx("div", { ref: rootRef, className: "cieo cieo-reaction-summary", role: "group", "aria-label": "Reactions", children: _jsxs("ul", { ref: listRef, className: "cieo-reaction-summary-list", children: [shown.map(({ chip, gone }) => (_jsx("li", { className: "cieo-reaction-summary-slot", "data-entering": entering.includes(chip.id) ? '' : undefined, "data-leaving": gone ? '' : undefined, children: _jsxs("button", { type: "button", className: "cieo-reaction-summary-chip", "aria-label": reactionName(chip), "aria-pressed": !!chip.mine, "data-mine": chip.mine ? '' : undefined, disabled: gone, tabIndex: gone ? -1 : undefined, onClick: () => onToggle(chip.id), children: [_jsx("span", { "aria-hidden": "true", className: "cieo-reaction-summary-emoji", children: chip.emoji }), _jsx("span", { "aria-hidden": "true", className: "cieo-reaction-summary-count", children: _jsx(CompactCount, { value: chip.count, hideZero: false }) })] }) }, chip.id))), onAdd ? (_jsx("li", { className: "cieo-reaction-summary-slot", children: _jsx(Popover, { open: open, onOpenChange: setOpen, trigger: _jsx("button", { type: "button", className: "cieo-reaction-summary-add", "aria-label": "Add a reaction", children: _jsx("span", { "aria-hidden": "true", children: "+" }) }), children: _jsx(ReactionPicker, { reactions: available, selected: mine, onPick: (id) => {
                                setOpen(false);
                                onAdd(id);
                                rootRef.current?.querySelector('.cieo-reaction-summary-add')?.focus();
                            } }) }) })) : null] }) }));
}

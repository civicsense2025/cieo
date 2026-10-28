// src/primitives/GroupAvatar/GroupAvatar.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/** Names as a short phrase: "Ava", "Ava and Ben", "Ava, Ben and Cy", "Ava, Ben and 3 others". Blank names are ignored. */
export function listNames(names) {
    const list = names.map((n) => n.trim()).filter(Boolean);
    if (list.length === 0)
        return '';
    if (list.length === 1)
        return list[0];
    if (list.length === 2)
        return `${list[0]} and ${list[1]}`;
    if (list.length === 3)
        return `${list[0]}, ${list[1]} and ${list[2]}`;
    return `${list[0]}, ${list[1]} and ${list.length - 2} others`;
}
/** Spoken label for the whole group, e.g. "Ava, Ben and 3 others". */
export function groupAvatarLabel(names) {
    return listNames(names);
}
/** Which faces to draw and how many people hide behind a "+n" tile. Up to four people show as faces; five or more show three faces plus the tile. */
export function groupAvatarLayout(people) {
    if (people.length <= 4)
        return { faces: [...people], more: 0 };
    return { faces: people.slice(0, 3), more: people.length - 3 };
}
export function GroupAvatar({ className, slotProps, people, size = 'md' }) {
    if (people.length === 0)
        return null;
    const { faces, more } = groupAvatarLayout(people);
    const slots = faces.length + (more > 0 ? 1 : 0);
    return (_jsxs("span", { role: "img", "aria-label": groupAvatarLabel(people.map((p) => p.name)), "data-size": size, "data-count": slots, className: "cieo cieo-group-avatar", ...customizePart(slotProps?.root, "cieo cieo-group-avatar", undefined, className), children: [faces.map((p, i) => (_jsx("span", { "aria-hidden": "true", className: "cieo-group-avatar-face", ...customizePart(slotProps?.face, "cieo-group-avatar-face", undefined), children: p.src ? _jsx("img", { src: p.src, alt: "", loading: "lazy" }) : _jsx("span", { className: "cieo-group-avatar-initials", ...customizePart(slotProps?.initials, "cieo-group-avatar-initials", undefined), children: p.initials }) }, `${p.name}-${i}`))), more > 0 ? (_jsxs("span", { "aria-hidden": "true", className: "cieo-group-avatar-face cieo-group-avatar-more", ...customizePart(slotProps?.face, "cieo-group-avatar-face cieo-group-avatar-more", undefined), children: ["+", more] })) : null] }));
}

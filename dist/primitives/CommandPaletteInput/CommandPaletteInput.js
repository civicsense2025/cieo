// src/primitives/CommandPaletteInput/CommandPaletteInput.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* CommandPaletteInput. Filter field for CommandPalette. Label stays available to assistive tech; value/onChange pass through. */
import { useContext, useId } from 'react';
import { CommandPaletteContext } from '../CommandPalette/CommandPalette.js';
export function CommandPaletteInput({ label, value, onChange, placeholder }) {
    const id = useId();
    const palette = useContext(CommandPaletteContext);
    const current = value ?? palette?.query;
    const emit = onChange ?? palette?.onQueryChange;
    return (_jsxs("div", { className: "cieo cieo-p-command-palette-input", children: [_jsx("label", { htmlFor: id, className: "cieo-vh", children: label }), _jsx("input", { id: id, type: "text", role: "combobox", "aria-expanded": "true", "aria-autocomplete": "list", value: current, placeholder: placeholder, onChange: (e) => emit?.(e.currentTarget.value), className: "cieo-p-command-palette-input-field" })] }));
}

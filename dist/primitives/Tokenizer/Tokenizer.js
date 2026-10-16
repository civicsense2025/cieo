// src/primitives/Tokenizer/Tokenizer.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Tokenizer. Token chips plus an add input. Chips are own spans (not the Token primitive); host owns the value list. */
import { useId, useState } from 'react';
export function Tokenizer({ label, values, onRemove, onAdd }) {
    const id = useId();
    const [draft, setDraft] = useState('');
    return (_jsxs("div", { className: "cieo cieo-p-tokenizer", children: [_jsx("label", { htmlFor: id, children: label }), _jsxs("div", { className: "cieo-p-tokenizer-chips", children: [values.map((v, i) => (_jsxs("span", { className: "cieo-p-tokenizer-chip", children: [v, _jsx("button", { type: "button", "aria-label": `Remove ${v}`, onClick: () => onRemove?.(i), children: "\u00D7" })] }, `${v}-${i}`))), _jsx("input", { id: id, type: "text", value: draft, onChange: (e) => setDraft(e.currentTarget.value), onKeyDown: (e) => {
                            if (e.key === 'Backspace' && draft === '' && values.length > 0)
                                onRemove?.(values.length - 1);
                            if (e.key === 'Enter' && draft.trim()) {
                                e.preventDefault();
                                onAdd?.(draft.trim());
                                setDraft('');
                            }
                        }, className: "cieo-p-tokenizer-input" })] })] }));
}

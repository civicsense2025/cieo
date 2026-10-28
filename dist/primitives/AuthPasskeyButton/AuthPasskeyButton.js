'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
import { customizePart } from '../customization.js';
export function AuthPasskeyButton({ className, slotProps, id, label = 'Continue with a passkey', pending, disabled, supported = true, style, onPress }) {
    const busy = pending || disabled;
    return (_jsxs("span", { className: "cieo cieo-auth-passkey-button", style: style, ...customizePart(slotProps?.root, "cieo cieo-auth-passkey-button", style, className), children: [_jsx("button", { type: "button", id: id, className: "cieo-auth-submit", disabled: busy, "aria-busy": pending || undefined, onClick: () => { if (!busy)
                    onPress?.(); }, ...customizePart(slotProps?.button, "cieo-auth-submit", undefined), children: _jsx(AuthSwapText, { value: pending ? 'Waiting for your passkey…' : label }) }), _jsx(AuthMotionMessage, { id: `${id}-fallback`, className: "cieo-auth-note", value: supported ? undefined : 'This device can’t use passkeys. Use your password or a code instead.' })] }));
}

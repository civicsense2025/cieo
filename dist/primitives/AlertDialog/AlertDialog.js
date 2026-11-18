// src/primitives/AlertDialog/AlertDialog.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useControllableState } from '../../state/react.js';
import { Dialog } from '../Dialog/Dialog.js';
import { customizePart } from '../customization.js';
export function AlertDialog({ label, open: openProp, defaultOpen = false, onOpenChange, onClose, children, className, slotProps, }) {
    const [open, setOpen] = useControllableState({
        value: openProp,
        defaultValue: defaultOpen,
        onChange: onOpenChange,
    });
    const handleClose = onClose !== undefined || onOpenChange !== undefined || openProp === undefined
        ? () => {
            setOpen(false);
            onClose?.();
        }
        : undefined;
    return (_jsx(Dialog, { label: label, role: "alertdialog", open: open, onClose: handleClose, dismissOnOutsidePress: false, className: className, slotProps: { root: slotProps?.root }, children: _jsx("div", { className: "cieo cieo-alert-dialog", ...customizePart(slotProps?.content, 'cieo cieo-alert-dialog'), children: children }) }));
}

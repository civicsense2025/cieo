'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* CieoI18nProvider / I18nProvider: root-installable locale, writing direction, and built-in UI string overrides. */
import { createContext, useContext, useMemo } from 'react';
import { customizePart } from '../customization.js';
export const DEFAULT_CIEO_STRINGS = Object.freeze({
    dismiss: 'Dismiss',
    close: 'Close',
    loading: 'Working',
    completed: 'Completed',
    failed: 'Failed',
    uncertain: 'Sending could not be confirmed',
    clearSearch: 'Clear search',
    noResults: 'No results',
    expandSheet: 'Change sheet height',
});
export const CieoI18nContext = createContext({
    locale: 'en',
    dir: 'ltr',
    strings: DEFAULT_CIEO_STRINGS,
});
export function CieoI18nProvider({ className, slotProps, locale, dir, strings, children, }) {
    const parent = useContext(CieoI18nContext);
    const value = useMemo(() => ({
        locale: locale ?? parent.locale,
        dir: dir ?? parent.dir,
        strings: strings ? { ...parent.strings, ...strings } : parent.strings,
    }), [locale, dir, strings, parent]);
    return (_jsx(CieoI18nContext.Provider, { value: value, children: _jsx("div", { lang: value.locale, dir: value.dir, className: "cieo cieo-i18n-provider", ...customizePart(slotProps?.root, 'cieo cieo-i18n-provider', undefined, className), children: children }) }));
}
export const I18nProvider = CieoI18nProvider;
export function useCieoI18n() {
    return useContext(CieoI18nContext);
}

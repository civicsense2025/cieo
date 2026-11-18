'use client';
/* CieoI18nProvider / I18nProvider: root-installable locale, writing direction, and built-in UI string overrides. */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CieoStrings {
  readonly dismiss: string;
  readonly close: string;
  readonly loading: string;
  readonly completed: string;
  readonly failed: string;
  readonly uncertain: string;
  readonly clearSearch: string;
  readonly noResults: string;
  readonly expandSheet: string;
}

export const DEFAULT_CIEO_STRINGS: CieoStrings = Object.freeze({
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

export interface CieoI18nContextValue {
  readonly locale: string;
  readonly dir: 'ltr' | 'rtl' | 'auto';
  readonly strings: CieoStrings;
}

export const CieoI18nContext = createContext<CieoI18nContextValue>({
  locale: 'en',
  dir: 'ltr',
  strings: DEFAULT_CIEO_STRINGS,
});

export interface I18nProviderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** BCP 47 locale tag (e.g. "en", "fr", "ar"). Defaults to "en". */
  locale?: string;
  /** Text direction applied to the subtree container. Defaults to "ltr". */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** Partial overrides merged over DEFAULT_CIEO_STRINGS. */
  strings?: Partial<CieoStrings>;
  children: ReactNode;
}

export type CieoI18nProviderProps = I18nProviderProps;

export function CieoI18nProvider({
  className,
  slotProps,
  locale,
  dir,
  strings,
  children,
}: I18nProviderProps) {
  const parent = useContext(CieoI18nContext);
  const value = useMemo<CieoI18nContextValue>(
    () => ({
      locale: locale ?? parent.locale,
      dir: dir ?? parent.dir,
      strings: strings ? { ...parent.strings, ...strings } : parent.strings,
    }),
    [locale, dir, strings, parent],
  );

  return (
    <CieoI18nContext.Provider value={value}>
      <div
        lang={value.locale}
        dir={value.dir}
        className="cieo cieo-i18n-provider"
        {...customizePart(slotProps?.root, 'cieo cieo-i18n-provider', undefined, className)}
      >
        {children}
      </div>
    </CieoI18nContext.Provider>
  );
}

export const I18nProvider = CieoI18nProvider;

export function useCieoI18n(): CieoI18nContextValue {
  return useContext(CieoI18nContext);
}

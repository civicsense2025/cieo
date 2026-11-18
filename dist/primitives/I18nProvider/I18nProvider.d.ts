import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
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
export declare const DEFAULT_CIEO_STRINGS: CieoStrings;
export interface CieoI18nContextValue {
    readonly locale: string;
    readonly dir: 'ltr' | 'rtl' | 'auto';
    readonly strings: CieoStrings;
}
export declare const CieoI18nContext: import("react").Context<CieoI18nContextValue>;
export interface I18nProviderProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** BCP 47 locale tag (e.g. "en", "fr", "ar"). Defaults to "en". */
    locale?: string;
    /** Text direction applied to the subtree container. Defaults to "ltr". */
    dir?: 'ltr' | 'rtl' | 'auto';
    /** Partial overrides merged over DEFAULT_CIEO_STRINGS. */
    strings?: Partial<CieoStrings>;
    children: ReactNode;
}
export type CieoI18nProviderProps = I18nProviderProps;
export declare function CieoI18nProvider({ className, slotProps, locale, dir, strings, children, }: I18nProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const I18nProvider: typeof CieoI18nProvider;
export declare function useCieoI18n(): CieoI18nContextValue;

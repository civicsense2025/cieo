export type Brand = 'studio' | 'iris' | 'lagoon' | 'ember' | 'rose' | 'mono';
export type Scheme = 'light' | 'dark';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Radius = 'crisp' | 'soft' | 'round';
export type Font = 'system' | 'humanist' | 'mono';
export type TokenValue = string | number | readonly string[];
export interface ThemeOptions {
  brand?: Brand; scheme?: Scheme; density?: Density; radius?: Radius;
  contrast?: 'standard' | 'high'; font?: Font; accent?: string;
  overrides?: Record<string, TokenValue>;
}
export interface Token {
  readonly type: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number';
  readonly value: TokenValue;
  readonly description: string;
}
declare const validatedTheme: unique symbol;
export interface Theme {
  readonly [validatedTheme]: true;
  readonly version: 1;
  readonly options: Readonly<Required<Omit<ThemeOptions, 'accent' | 'overrides'>> & Pick<ThemeOptions, 'accent'> & { overrides: Readonly<Record<string, TokenValue>> }>;
  readonly tokens: Readonly<Record<string, Token>>;
}
export interface ContrastResult { name: string; ratio: number; minimum: number; pass: boolean }
export interface ThemeController { readonly theme: Theme; update(theme: Theme): void; destroy(): void }
export function createTheme(options?: ThemeOptions): Theme;
export function auditTheme(theme: Theme): ContrastResult[];
export function contrastRatio(first: string, second: string): number;
export function variables(theme: Theme): Record<string, string>;
export function toCSS(theme: Theme, selector?: string): string;
export function toDTCG(theme: Theme): { $description: string; cieo: Record<string, unknown> };
export function toPortable(theme: Theme): Record<string, unknown>;
export function serializeTheme(theme: Theme): string;
export function parseTheme(source: string): Theme;
export function applyTheme(element: HTMLElement | SVGElement, theme: Theme): ThemeController;
export function toNative(theme: Theme, target: 'swift' | 'rust' | 'kotlin' | 'dart' | 'python' | 'c', options?: { namespace?: string; referenceFontSize?: number }): string;
export const brands: Readonly<Record<Brand, Readonly<{ light: string; dark: string; label: string }>>>;
export const densities: Readonly<Record<Density, number>>;
export const radii: Readonly<Record<Radius, readonly number[]>>;
export const fonts: Readonly<Record<Font, readonly string[]>>;
export function themeSchema(): Record<string, unknown>;

export type Brand = 'studio' | 'iris' | 'lagoon' | 'ember' | 'rose' | 'mono' | 'instrument';
export type Scheme = 'light' | 'dark';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Radius = 'square' | 'crisp' | 'soft' | 'round' | 'pill';
export type Font = 'system' | 'humanist' | 'mono';
export type Display = 'sans' | 'serif';
export type Ground = 'cool' | 'paper' | 'mist';
export type Elevation = 'soft' | 'ring';
export type TokenValue = string | number | readonly string[];
export type ComponentTokenMap = Readonly<Record<string, Readonly<Record<string, string | number>>>>;
export interface OklchColor { readonly l: number; readonly c: number; readonly h: number }
export type TonalRamp = Readonly<Record<0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 98 | 100, string>>;
export interface ThemeReference {
  readonly neutral: TonalRamp;
  readonly accent: TonalRamp;
  readonly success: TonalRamp;
  readonly warning: TonalRamp;
  readonly danger: TonalRamp;
  readonly info: TonalRamp;
  readonly springs: Readonly<{ snap: number; base: number; soft: number; lazy: number }>;
}
export interface ThemeOptions {
  brand?: Brand; scheme?: Scheme; density?: Density; radius?: Radius;
  contrast?: 'standard' | 'high'; font?: Font; display?: Display; ground?: Ground; elevation?: Elevation;
  zeta?: number; accent?: string;
  components?: Record<string, Record<string, string | number>>;
  overrides?: Record<string, TokenValue>;
}
export interface Token {
  readonly type: 'color' | 'dimension' | 'duration' | 'fontFamily' | 'fontWeight' | 'number';
  readonly value: TokenValue;
  readonly description: string;
}
declare const validatedTheme: unique symbol;
export interface Theme {
  readonly [validatedTheme]: true;
  readonly version: 1;
  readonly options: Readonly<Required<Omit<ThemeOptions, 'accent' | 'components' | 'overrides'>> & Pick<ThemeOptions, 'accent'> & { components: ComponentTokenMap; overrides: Readonly<Record<string, TokenValue>> }>;
  readonly reference: ThemeReference;
  readonly tokens: Readonly<Record<string, Token>>;
}
export interface ContrastResult { name: string; ratio: number; minimum: number; pass: boolean }
export interface ThemeController { readonly theme: Theme; update(theme: Theme): void; destroy(): void }
export function createTheme(options?: ThemeOptions): Theme;
export function auditTheme(theme: Theme): ContrastResult[];
export function contrastRatio(first: string, second: string): number;
export function hexToOklch(value: string): OklchColor;
export function oklchToHex(l: number, c: number, h?: number): string;
export function tonalRamp(seed: string): TonalRamp;
export function toSwiftPresets(): string;
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
export const displays: Readonly<Record<Display, readonly string[] | null>>;
export const grounds: Readonly<Record<Ground, Readonly<Record<Scheme, Readonly<Record<string, string>>>>>>;
export const elevations: Readonly<Record<Elevation, Elevation>>;
export function themeSchema(): Record<string, unknown>;
export interface SystemPreferences { readonly scheme: Scheme; readonly reduced: boolean; readonly contrast: 'standard' | 'high' }
export function watchSystemPreferences(listener: (preferences: SystemPreferences) => void, host?: Pick<Window, 'matchMedia'> | Record<string, never>): () => void;

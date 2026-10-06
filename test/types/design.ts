import { createTheme, applyTheme, toCSS, toNative, watchSystemPreferences, type Theme } from 'cieo/design';
const theme: Theme = createTheme({ brand: 'iris', density: 'compact', overrides: { 'space-2': '0.5rem' } });
toCSS(theme, '.app');
toNative(theme, 'swift', { namespace: 'ExampleTokens', referenceFontSize: 20 });
const controller = applyTheme(document.documentElement, theme);
controller.update(createTheme({ scheme: 'dark' })); controller.destroy();
watchSystemPreferences((preferences) => { const scheme: 'light' | 'dark' = preferences.scheme; void scheme; });
// @ts-expect-error Unknown brands must fail in typed consumers.
createTheme({ brand: 'missing' });
// @ts-expect-error A raw record is not a validated Theme.
toCSS({ version: 1, tokens: {} });
// @ts-expect-error Themes must remain immutable.
theme.tokens['space-2'].value = '1rem';
// @ts-expect-error Only implemented code generators are available.
toNative(theme, 'haskell');

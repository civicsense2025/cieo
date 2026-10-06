// Server rendering needs neither a browser nor a framework.
import { createTheme, toCSS } from '../design/index.js';
const theme = createTheme({ brand: 'lagoon', scheme: 'dark' });
process.stdout.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Cieo SSR</title>
<style>${toCSS(theme)}</style><link rel="stylesheet" href="/design/primitives.css"></head>
<body class="cieo"><main class="cieo-surface"><h1>A server-rendered foundation.</h1></main></body></html>\n`);

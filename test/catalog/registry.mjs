// Evaluate the declared recipes without initializing previews. Blocks can register
// multiple atoms, so neither blocks.json nor index.json supplies an atom count.
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
const directory = new URL('../../atoms/web/', import.meta.url);
const context = vm.createContext({
  window: {}, document: { currentScript: null, getElementById: () => null, createElement: () => ({}), head: { insertAdjacentHTML() {}, appendChild() {} } },
  matchMedia: () => ({ matches: false }), performance: { now: () => 0 },
  ResizeObserver: class { observe() {} }, requestAnimationFrame() {},
});
const blocks = JSON.parse(fs.readFileSync(new URL('blocks.json', directory), 'utf8'));
for (const file of ['runtime.core.js', ...blocks]) {
  context.window.CIEO_SOURCE_HINT = file;
  vm.runInContext(fs.readFileSync(new URL(file, directory), 'utf8'), context, { filename: file });
}
export const recipes = JSON.parse(vm.runInContext('JSON.stringify(A.map(({id, file}) => ({id, file})))', context));
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(recipes));
}

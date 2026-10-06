/* ================================================================ atoms */
const A = [];
// Source attribution is metadata only; every recipe's init/render contract is unchanged.
const atom = o => {
  const source = document.currentScript?.dataset.cieoRecipeFile || globalThis.__cieoRecipeFile;
  if (source) o.sourceFile = source;
  return A.push(o);
};

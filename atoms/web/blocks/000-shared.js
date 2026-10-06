/* ================================================================ atoms */
const A = [];
// Keep each recipe's actual source path when the same stage opens in the inspector.
// Source attribution is metadata only; every recipe's init/render contract is unchanged.
const atom = o => {
  const src = document.currentScript?.getAttribute('src');
  o.file = src?.includes('/atoms/web/') ? src.split('/atoms/web/')[1] : window.CIEO_SOURCE_HINT;
  const legacy = document.currentScript?.dataset.cieoRecipeFile || globalThis.__cieoRecipeFile;
  if (legacy) o.sourceFile = legacy;
  A.push(o);
};

/* ================================================================ atoms */
const A = [];
// Keep each recipe's actual source path when the same stage opens in the inspector.
const atom = o => {
  const src = document.currentScript?.getAttribute('src');
  o.file = src?.includes('/atoms/web/') ? src.split('/atoms/web/')[1] : window.CIEO_SOURCE_HINT;
  A.push(o);
};
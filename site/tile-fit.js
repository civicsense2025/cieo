// Scales each library tile's live preview down so the whole scene fits its frame; never scales up.
const fit = () => {
  for (const stage of document.querySelectorAll('.tile-stage')) {
    const canvas = stage.firstElementChild;
    if (!canvas) continue;
    canvas.style.zoom = '';
    const pad = 24;
    const scale = Math.min(1, (stage.clientWidth - pad) / canvas.offsetWidth, (stage.clientHeight - pad) / canvas.offsetHeight);
    if (scale < 1) canvas.style.zoom = String(Math.max(scale, 0.35));
  }
};
fit();
addEventListener('resize', fit);
document.fonts?.ready.then(fit);

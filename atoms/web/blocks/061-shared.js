
// popover enter/exit: 97% scale, 4px offset, blur
const pop = (el, p, dy = -4) => { p = clamp(p); el.style.zIndex = 30; el.style.opacity = p.toFixed(3); el.style.visibility = p < .01 ? 'hidden' : 'visible';
  el.style.transform = `translateY(${px((1-p)*dy)}) scale(${(.97+.03*p).toFixed(4)})`; el.style.filter = p < .98 ? `blur(${((1-p)*BLUR).toFixed(2)}px)` : 'none'; el.style.pointerEvents = p > .5 ? 'auto' : 'none'; };
/* ---- PhotoKit: procedural photographs, generated in the page ----
   Artifacts cannot load outside images, so every transition atom draws its photos here.
   PhotoKit.get(name, w, h, { tod }) → cached canvas. tod 0 = midday, 1 = golden hour,
   so two calls with the same name and size are pixel-aligned pairs (relight, compare).
   PhotoKit.url(...) → data URL for <img>/CSS. PhotoKit.NAMES lists the scenes. */
(() => {
const rnd = s => () => { s = (s*16807) % 2147483647; return (s - 1)/2147483646; };
const mixC = (a, b, p) => a.map((v, i) => Math.round(v + (b[i] - v)*p));
const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;
// each scene: palette at midday (d) and golden hour (g), and a drawing recipe
const SCENES = {
  ridge:   { seed:11, kind:'mountains', d:{ sky:[[150,186,214],[214,228,236]], land:[[86,104,96],[58,72,70],[38,48,50]], sun:[255,250,235] }, g:{ sky:[[232,150,98],[250,214,160]], land:[[120,84,70],[82,58,56],[46,36,40]], sun:[255,214,150] } },
  lake:    { seed:23, kind:'lake', d:{ sky:[[162,196,222],[226,236,240]], land:[[92,118,96],[62,84,72],[44,58,54]], sun:[255,252,240] }, g:{ sky:[[214,132,104],[246,200,150]], land:[[112,92,70],[80,62,52],[50,40,38]], sun:[255,206,140] } },
  dunes:   { seed:37, kind:'dunes', d:{ sky:[[170,200,224],[232,236,236]], land:[[214,190,150],[190,160,120],[160,128,96]], sun:[255,252,240] }, g:{ sky:[[226,140,96],[250,206,150]], land:[[226,158,104],[190,118,80],[140,84,64]], sun:[255,210,140] } },
  city:    { seed:41, kind:'city', d:{ sky:[[158,190,216],[220,230,236]], land:[[110,118,126],[80,88,98],[54,60,70]], sun:[255,252,240] }, g:{ sky:[[204,124,100],[244,190,140]], land:[[96,78,82],[70,56,62],[40,34,42]], sun:[255,200,130] } },
  coast:   { seed:53, kind:'coast', d:{ sky:[[150,190,222],[220,234,240]], land:[[70,120,140],[150,138,112],[96,104,84]], sun:[255,252,240] }, g:{ sky:[[220,128,100],[248,204,146]], land:[[110,96,120],[176,120,90],[92,70,60]], sun:[255,204,136] } },
  forest:  { seed:67, kind:'forest', d:{ sky:[[176,204,218],[226,234,232]], land:[[70,100,74],[48,74,56],[30,50,40]], sun:[255,252,240] }, g:{ sky:[[214,146,104],[244,206,150]], land:[[96,90,58],[66,62,44],[38,38,32]], sun:[255,210,140] } },
  field:   { seed:79, kind:'field', d:{ sky:[[156,192,222],[228,236,238]], land:[[150,166,96],[118,138,78],[90,108,62]], sun:[255,252,240] }, g:{ sky:[[226,144,96],[250,212,152]], land:[[196,150,80],[160,116,62],[118,82,52]], sun:[255,212,140] } },
  canyon:  { seed:97, kind:'canyon', d:{ sky:[[160,196,224],[230,236,238]], land:[[190,120,90],[158,92,70],[110,66,54]], sun:[255,252,240] }, g:{ sky:[[214,120,90],[246,196,140]], land:[[214,118,74],[170,82,56],[106,52,44]], sun:[255,200,130] } },
  harbor:  { seed:101, kind:'harbor', d:{ sky:[[164,196,220],[226,234,238]], land:[[84,120,146],[120,108,98],[70,64,62]], sun:[255,252,240] }, g:{ sky:[[206,126,104],[244,196,144]], land:[[118,96,112],[150,104,80],[70,52,50]], sun:[255,204,134] } },
  meadow:  { seed:113, kind:'meadow', d:{ sky:[[170,202,224],[232,238,236]], land:[[132,160,100],[100,132,84],[74,100,66]], sun:[255,252,240] }, g:{ sky:[[230,154,104],[250,216,160]], land:[[176,150,86],[136,112,66],[96,76,50]], sun:[255,214,146] } },
  studio:  { seed:127, kind:'still', d:{ sky:[[226,222,214],[240,236,228]], land:[[196,186,170],[150,120,96],[90,96,86]], sun:[255,255,250] }, g:{ sky:[[214,182,150],[236,214,186]], land:[[190,160,128],[150,100,70],[80,74,60]], sun:[255,226,180] } },
  portrait:{ seed:131, kind:'portrait', d:{ sky:[[196,206,210],[226,230,230]], land:[[204,170,148],[70,62,60],[120,132,140]], sun:[255,255,250] }, g:{ sky:[[206,160,128],[234,200,164]], land:[[216,162,126],[64,50,48],[128,108,100]], sun:[255,220,170] } }
};
const NAMES = Object.keys(SCENES);
const ridgeLine = (r, n, amp, base, rough) => { const ph = [r()*6, r()*6, r()*6], f = [.025 + r()*.02, .07 + r()*.05, .19 + r()*.1], pts = []; let v = 0;
  for (let i = 0; i <= n; i++){ v = v*.6 + (r() - .5)*.8; const s3 = k => .5 + .5*Math.sin(i*f[k] + ph[k]); pts.push(base - amp*.42*(.58*s3(0) + .28*s3(1) + .14*s3(2)) - v*rough*.9); } return pts; };
function draw(name, w, h, tod){
  const S = SCENES[name], P = k => S.d[k].map((c, i) => mixC(c, S.g[k][i], tod));
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'), r = rnd(S.seed);
  const sky = P('sky'), land = P('land'), sun = mixC(S.d.sun, S.g.sun, tod);
  const sg = x.createLinearGradient(0, 0, 0, h*.7); sg.addColorStop(0, css(sky[0])); sg.addColorStop(1, css(sky[1])); x.fillStyle = sg; x.fillRect(0, 0, w, h);
  // sun sinks and warms toward golden hour
  const sx = w*(.68 - .1*tod), sy = h*(.18 + .3*tod), sr = Math.min(w, h)*(.05 + .02*tod);
  const halo = x.createRadialGradient(sx, sy, 0, sx, sy, sr*(5 + 4*tod)); halo.addColorStop(0, `rgba(${sun},${.55 + .25*tod})`); halo.addColorStop(1, `rgba(${sun},0)`); x.fillStyle = halo; x.fillRect(0, 0, w, h);
  x.fillStyle = css(sun); x.beginPath(); x.arc(sx, sy, sr, 0, 7); x.fill();
  // soft cloud bands
  for (let i = 0; i < 5; i++){ const cy = h*(.08 + r()*.3), cw = w*(.3 + r()*.5), cx = r()*w; x.fillStyle = `rgba(255,${240 - 30*tod},${230 - 50*tod},${.12 + r()*.12})`; x.beginPath(); x.ellipse(cx, cy, cw/2, h*.018 + r()*h*.02, 0, 0, 7); x.fill(); }
  const layer = (col, base, amp, rough, n = 120) => { const pts = ridgeLine(r, n, amp, base, rough); x.fillStyle = css(col); x.beginPath(); x.moveTo(0, h); pts.forEach((y, i) => x.lineTo(i/n*w, y)); x.lineTo(w, h); x.fill(); return pts; };
  const k = S.kind;
  if (k === 'mountains' || k === 'canyon'){ layer(mixC(land[0], sky[1], .45), h*.52, h*.5, 6); layer(land[0], h*.6, h*.5, 7); layer(land[1], h*.72, h*.35, 5); layer(land[2], h*.86, h*.2, 3); }
  else if (k === 'lake' || k === 'coast' || k === 'harbor'){
    layer(mixC(land[1], sky[1], .4), h*.5, h*.3, 5); const wl = h*.6; layer(land[k === 'lake' ? 1 : 2], wl - h*.02, h*.12, 3);
    const wg = x.createLinearGradient(0, wl, 0, h); wg.addColorStop(0, css(mixC(sky[1], land[0], .3))); wg.addColorStop(1, css(mixC(sky[0], land[0], .55))); x.fillStyle = wg; x.fillRect(0, wl, w, h - wl);
    for (let i = 0; i < 40; i++){ const yy = wl + (h - wl)*Math.pow(r(), 1.6), ww = w*(.04 + r()*.18); x.fillStyle = `rgba(${sun},${.08 + .2*tod*r()})`; x.fillRect(sx - ww/2 + (r() - .5)*w*.2, yy, ww, 1 + r()*2); }
    if (k === 'harbor'){ for (let i = 0; i < 6; i++){ const bx = w*(.1 + r()*.8), by = wl + h*(.05 + r()*.2), bs = w*.03*(1 + r()); x.fillStyle = css(land[2]); x.fillRect(bx, by, bs*1.6, bs*.35); x.fillRect(bx + bs*.7, by - bs*1.6, 2, bs*1.6); } }
    if (k === 'coast') layer(land[1], h*.9, h*.1, 2);
  }
  else if (k === 'dunes' || k === 'field' || k === 'meadow'){ layer(mixC(land[0], sky[1], .5), h*.58, h*.12, 2); for (let i = 0; i < 4; i++) layer(mixC(land[i % 3], land[(i + 1) % 3], r()), h*(.64 + i*.09), h*.08, 1.5);
    if (k !== 'dunes') for (let i = 0; i < 260; i++){ const yy = h*(.7 + r()*.3), xx = r()*w; x.strokeStyle = `rgba(${land[2]},${.25 + r()*.4})`; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + (r() - .5)*4, yy - 4 - r()*10*(yy/h)); x.stroke(); } }
  else if (k === 'city'){ layer(mixC(land[0], sky[1], .4), h*.62, h*.1, 1); let bx = 0; while (bx < w){ const bw = w*(.04 + r()*.07), bh = h*(.12 + r()*.4); x.fillStyle = css(mixC(land[1], land[2], r())); x.fillRect(bx, h*.78 - bh, bw - 2, bh + h); for (let j = 0; j < 12; j++){ if (r() < .45){ x.fillStyle = `rgba(${sun},${.15 + .6*tod})`; x.fillRect(bx + 3 + r()*(bw - 10), h*.78 - bh + 6 + r()*(bh - 10), 3, 4); } } bx += bw; } x.fillStyle = css(land[2]); x.fillRect(0, h*.78, w, h); }
  else if (k === 'forest'){ layer(mixC(land[0], sky[1], .5), h*.55, h*.15, 3); for (let row = 0; row < 3; row++){ const base = h*(.62 + row*.12), col = land[row]; for (let i = 0; i < 26 + row*10; i++){ const tx = r()*w, th = h*(.12 + r()*.16)*(1 + row*.3), tw = th*.32; x.fillStyle = css(col); x.beginPath(); x.moveTo(tx, base - th); x.lineTo(tx - tw, base + 4); x.lineTo(tx + tw, base + 4); x.fill(); } x.fillRect(0, base, w, h); } }
  else if (k === 'still'){ x.fillStyle = css(mixC(sky[1], land[0], .3)); x.fillRect(0, h*.62, w, h); const items = [[.3, .2, 0], [.52, .3, 1], [.7, .16, 2]];
    items.forEach(([fx, fr, ci]) => { const cx = w*fx, rr = Math.min(w, h)*fr*.5, cy = h*.62 - rr*.6; const g = x.createRadialGradient(cx - rr*.4, cy - rr*.5, rr*.1, cx, cy, rr*1.1); g.addColorStop(0, css(mixC(land[ci], [255,255,255], .35))); g.addColorStop(1, css(mixC(land[ci], [0,0,0], .35))); x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, rr*.85, rr, 0, 0, 7); x.fill();
      x.fillStyle = `rgba(0,0,0,${.18 - .06*tod})`; x.beginPath(); x.ellipse(cx + rr*(.5 + tod), h*.62 + rr*.08, rr*(1 + tod), rr*.12, 0, 0, 7); x.fill(); }); }
  else if (k === 'portrait'){ const bg = x.createLinearGradient(0, 0, w, 0); bg.addColorStop(0, css(sky[0])); bg.addColorStop(1, css(sky[1])); x.fillStyle = bg; x.fillRect(0, 0, w, h);
    const cx = w*.5, cy = h*.42, hr = Math.min(w, h)*.17; x.fillStyle = css(land[2]); x.beginPath(); x.ellipse(cx, h*1.02, hr*2.3, h*.42, 0, 0, 7); x.fill();
    x.fillStyle = css(land[0]); x.fillRect(cx - hr*.35, cy + hr*.7, hr*.7, hr*.8); const fg = x.createRadialGradient(cx - hr*(.4 - .8*tod), cy - hr*.3, hr*.2, cx, cy, hr*1.3); fg.addColorStop(0, css(mixC(land[0], [255,240,220], .35))); fg.addColorStop(1, css(mixC(land[0], [40,30,30], .3))); x.fillStyle = fg; x.beginPath(); x.ellipse(cx, cy, hr*.82, hr, 0, 0, 7); x.fill();
    x.fillStyle = css(land[1]); x.beginPath(); x.ellipse(cx, cy - hr*.55, hr*.95, hr*.62, 0, Math.PI, 0); x.fill(); }
  // film grain, very light, seeded so pairs stay aligned
  const id = x.getImageData(0, 0, w, h), d = id.data, gr = rnd(S.seed + 999);
  for (let i = 0; i < d.length; i += 4){ const n = (gr() - .5)*10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  x.putImageData(id, 0, 0); return cv;
}
const cache = new Map();
const get = (name, w = 960, h = 640, o = {}) => { const tod = o.tod ?? 0, key = `${name}|${w}|${h}|${tod}`; if (!cache.has(key)) cache.set(key, draw(name, Math.round(w), Math.round(h), tod)); return cache.get(key); };
const urls = new Map();
const url = (name, w, h, o = {}) => { const key = `${name}|${w}|${h}|${o.tod ?? 0}`; if (!urls.has(key)) urls.set(key, get(name, w, h, o).toDataURL('image/jpeg', .86)); return urls.get(key); };
globalThis.PhotoKit = { get, url, NAMES, CAPTIONS:{ ridge:'Ridge line, Sierra Nevada', lake:'Still lake at dawn', dunes:'Dunes after wind', city:'Downtown, east side', coast:'Coast road', forest:'Spruce stand', field:'Late summer field', canyon:'Canyon wall', harbor:'Harbor, low tide', meadow:'High meadow', studio:'Still life, three pears', portrait:'Portrait, window light' } };
})();

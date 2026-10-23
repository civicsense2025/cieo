
// Audio recipes. Levels and time are simulated from the clock: no network, no audio playback.
const AU_FMT = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
// A fixed pseudo-waveform: the same shape on every load, shaped like a phrase.
const AU_AMP = (i, n) => clamp(.2 + .8*Math.abs(Math.sin(i*1.9)*Math.cos(i*.47) + .35*Math.sin(i*.8))*(.55 + .45*Math.sin(i/n*Math.PI)), .14, 1);
// A simulated microphone envelope: syllable bursts riding a slow phrase swell.
const AU_LEVEL = t => clamp(.1 + .62*Math.abs(Math.sin(t*5.3))*(.55 + .45*Math.sin(t*1.7 + 1)) + .18*Math.abs(Math.sin(t*13.1)), 0, 1);
const AU_PLAY = [[7,5],[12.5,8.4],[12.5,15.6],[7,19],[12.5,8.4],[19,12],[19,12],[12.5,15.6]], AU_PAUSE = [[6,5],[10,5],[10,19],[6,19],[14,5],[18,5],[18,19],[14,19]];
// Play and pause are the same eight points; k morphs one into the other.
const AU_ICON = k => { const p = AU_PLAY.map((a,i) => [lerp(a[0], AU_PAUSE[i][0], k), lerp(a[1], AU_PAUSE[i][1], k)]), q = a => `M${a.map(v => v[0].toFixed(2) + ' ' + v[1].toFixed(2)).join('L')}Z`; return q(p.slice(0,4)) + q(p.slice(4)); };
const AU_EL = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
const AU_BTN = 'border:0;border-radius:50%;width:44px;height:44px;flex:none;display:grid;place-items:center;cursor:pointer;padding:0;';

atom({ id:'audio-voice-note', cat:'Audio', name:'Voice note player', block:'audio, voice note, player', fam:['M','S','D','T'],
  html:`<div class="card col" style="width:min(340px,94%);padding:12px;gap:8px"><div class="row" style="gap:10px"><button class="vn-pp" aria-label="Play voice note" style="${AU_BTN}background:var(--ink);color:var(--card)"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path class="vn-ic"/></svg></button><div class="vn-sc" role="slider" tabindex="0" aria-label="Seek voice note" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="position:relative;flex:1;min-width:0;height:44px;display:flex;align-items:center;gap:2px;cursor:pointer;touch-action:none"></div><button class="vn-rate" aria-label="Playback speed 1x" style="position:relative;width:52px;height:44px;flex:none;border:0;border-radius:10px;background:var(--raised);color:var(--ink);font-size:13px;font-weight:600;cursor:pointer;padding:0"></button></div><div class="row small muted num" style="justify-content:space-between;padding:0 2px"><span class="vn-t">0:00</span><span>0:23</span></div></div><div class="hint">Play, drag the waveform or press the arrow keys to scrub, tap the speed to change it</div>`,
  desc:'Play and pause are one shape on one spring. The waveform fills continuously with the playhead, the speed button swaps 1x, 1.5x and 2x without a jump in position, and dragging or the arrow keys scrub.',
  api:'pos(t) = playing ? min(1, p0 + (t − t0)·rate/DUR) : p0   rate: p0 = pos(now); t0 = now',
  init(st){
    const DUR = 23, N = 40, RATES = [1, 1.5, 2], LABELS = ['1×', '1.5×', '2×'];
    const vnPlay = $(st,'button.vn-pp');
    const vnRate = $(st,'button.vn-rate');
    const path = $(st,'.vn-ic'), sc = $(st,'.vn-sc'), tc = $(st,'.vn-t');
    const bars = [...Array(N)].map((_,i) => { const b = AU_EL('i', `flex:1;min-width:2px;border-radius:2px;height:${(AU_AMP(i,N)*32).toFixed(1)}px;background:var(--raised);transform-origin:50% 50%`); sc.appendChild(b); return b; });
    const dot = AU_EL('i', 'position:absolute;left:0;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:var(--accent);pointer-events:none'); sc.appendChild(dot);
    const rl = LABELS.map(s => { const e = AU_EL('span', 'font-variant-numeric:tabular-nums', s); e.className = 'layer'; vnRate.appendChild(e); return e; });
    const rsw = new Swap(0), ic = new Track(0, S.snap), gr = new Track(0, S.snap);
    let playing = false, p0 = 0, t0 = 0, rate = 0, held = false, hp = 0, ended = false;
    const pos = t => playing ? Math.min(1, p0 + (t - t0)*RATES[rate]/DUR) : p0;
    const label = () => vnPlay.setAttribute('aria-label', ended ? 'Replay voice note' : playing ? 'Pause voice note' : 'Play voice note');
    const seek = p => { p0 = clamp(p); t0 = now(); ended = false; label(); };
    vnPlay.onclick = () => { const t = now(); if (ended || p0 >= 1) p0 = 0; else p0 = pos(t); t0 = t; ended = false; playing = !playing; if (REDUCE) ic.jump(playing ? 1 : 0); else ic.set(playing ? 1 : 0); label(); };
    vnRate.onclick = () => { const t = now(); p0 = pos(t); t0 = t; rate = (rate + 1) % RATES.length; rsw.to(rate); vnRate.setAttribute('aria-label', `Playback speed ${LABELS[rate].replace('×','x')}`); };
    drag(sc, { down:p => { held = true; hp = clamp(p.x/p.w); gr.set(1); }, move:p => { hp = clamp(p.x/p.w); }, up:() => { held = false; seek(hp); gr.set(0); } });
    sc.onkeydown = e => { const d = { ArrowRight:.05, ArrowUp:.05, ArrowLeft:-.05, ArrowDown:-.05 }[e.key]; const jump = e.key === 'Home' ? 0 : e.key === 'End' ? .999 : null;
      if (d || jump !== null){ e.preventDefault(); seek(jump !== null ? jump : pos(now()) + d); } };
    const cache = new Array(N).fill('');
    return t => {
      if (playing && !held && p0 + (t - t0)*RATES[rate]/DUR >= 1){ playing = false; p0 = 1; ended = true; if (REDUCE) ic.jump(0); else ic.set(0); label(); }
      const k = clamp(ic.at(t)); path.setAttribute('d', AU_ICON(k));
      const p = held ? hp : pos(t), W = size(sc).cw, g = clamp(gr.at(t)), ds = 10 + 6*g;
      bars.forEach((b,i) => { const f = Math.round(clamp(p*N - i)*20)/20, c = mix(f, 'var(--accent)', 'var(--raised)'); if (cache[i] !== c){ cache[i] = c; b.style.background = c; }
        const lift = playing && !REDUCE ? 1 + .35*Math.max(0, 1 - Math.abs(p*N - i - .5)) : 1; b.style.transform = `scaleY(${lift.toFixed(3)})`; });
      dot.style.width = dot.style.height = px(ds); dot.style.marginTop = px(-ds/2); dot.style.transform = `translateX(${px(p*W - ds/2)})`;
      tc.textContent = AU_FMT(p*DUR); sc.setAttribute('aria-valuenow', Math.round(p*100)); sc.setAttribute('aria-valuetext', `${AU_FMT(p*DUR)} of 0:23`);
      rl.forEach((e,i) => rsw.apply(e, i, t));
    };
  }});

atom({ id:'audio-recorder', cat:'Audio', name:'Voice recorder', block:'audio, record, waveform', fam:['M','S','T'], tall:true,
  html:`<div class="col rc-root" style="width:min(340px,94%);gap:12px;align-items:flex-start"><div class="rc-pill" style="position:relative;height:56px;width:56px;border-radius:28px;background:var(--card);box-shadow:var(--shadow);overflow:hidden"><button class="rc-mic" aria-label="Record a voice note" style="${AU_BTN}position:absolute;left:6px;top:6px;background:var(--ink);color:var(--card)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button><div class="rc-rec" style="position:absolute;inset:0;display:flex;align-items:center;gap:6px;padding:0 6px"><button class="rc-cancel" aria-label="Cancel recording" style="${AU_BTN}background:var(--raised);color:var(--ink)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="rc-live" aria-hidden="true" style="flex:1;min-width:0;height:36px;display:flex;align-items:center;gap:2px;overflow:hidden"></div><span class="rc-tm num" role="timer" aria-label="Recording time" style="display:inline-flex;align-items:center;font-size:14px;font-weight:600;flex:none;white-space:nowrap"><span class="rc-m"></span><span>:</span><span class="rc-s"></span></span><button class="rc-stop" aria-label="Stop and keep recording" style="${AU_BTN}background:var(--danger);color:var(--card)"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg></button></div><div class="rc-clip" style="position:absolute;inset:0;display:flex;align-items:center;gap:8px;padding:0 6px"><button class="rc-play" aria-label="Play clip" style="${AU_BTN}background:var(--ink);color:var(--card)"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path class="rc-ic"/></svg></button><div class="rc-bars" aria-hidden="true" style="flex:1;min-width:0;height:36px;display:flex;align-items:center;gap:2px"></div><span class="rc-len num" style="font-size:13px;font-weight:600;min-width:34px;text-align:right"></span><button class="rc-del" aria-label="Delete clip" style="${AU_BTN}background:var(--raised);color:var(--ink)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div></div><span class="small muted rc-note" aria-live="polite" style="min-height:19px;padding-left:4px"></span></div><div class="hint">Tap the mic, then Stop to keep the clip or Cancel to collapse. Escape cancels</div>`,
  desc:'Tapping the mic grows the pill into live level bars and rolling mm:ss digits. Cancel collapses it back. Stop springs the bars from the live heights into a static waveform and the pill becomes a clip card.',
  api:'level(t) = envelope(t − t0)   bars = rolling history   stop: bar[i].spring(live[i] → resample(history)[i])',
  init(st){
    const NL = 26, NC = 30;
    const root = $(st,'.rc-root'), pill = $(st,'.rc-pill');
    const rcMic = $(st,'button.rc-mic');
    const rcCancel = $(st,'button.rc-cancel');
    const rcStop = $(st,'button.rc-stop');
    const rcPlay = $(st,'button.rc-play');
    const rcDel = $(st,'button.rc-del');
    const recEl = $(st,'.rc-rec'), clipEl = $(st,'.rc-clip'), live = $(st,'.rc-live'), cbars = $(st,'.rc-bars'), note = $(st,'.rc-note'), len = $(st,'.rc-len'), ic = $(st,'.rc-ic');
    const dm = new Digits($(st,'.rc-m'), 1), ds = new Digits($(st,'.rc-s'), 2); dm.set('0', true); ds.set('00', true);
    const lb = [...Array(NL)].map(() => { const b = AU_EL('i', 'flex:1;min-width:2px;border-radius:2px;height:4px;background:var(--danger)'); live.appendChild(b); return b; });
    const cb = [...Array(NC)].map(() => { const b = AU_EL('i', 'flex:1;min-width:2px;border-radius:2px;height:4px;background:var(--raised)'); cbars.appendChild(b); return b; });
    const ch = cb.map(() => new Track(4, S.soft)), width = new Track(56, S.base), icon = new Track(0, S.snap), sw = new Swap('idle'), mic = new Swap('idle');
    let state = 'idle', t0 = 0, hist = Array(NL).fill(0), samples = [], lastS = -1, sec = -1, clipLen = 1, playing = false, pp = 0, pt0 = 0;
    const target = () => Math.min(size(root).cw || 320, 330);
    const go = (next, w, t) => { state = next; sw.to(next, t); mic.to(next, t); if (REDUCE) width.jump(w); else width.set(w, S.base, t); };
    const say = s => { note.textContent = s; };
    rcMic.onclick = () => { const t = now(); t0 = t; hist = Array(NL).fill(0); samples = []; lastS = -1; sec = -1; dm.set('0', true); ds.set('00', true); go('rec', target(), t); say('Recording'); rcStop.focus({ preventScroll:true }); };
    const cancel = () => { if (state !== 'rec') return; go('idle', 56, now()); say('Recording cancelled'); rcMic.focus({ preventScroll:true }); };
    rcCancel.onclick = cancel;
    pill.onkeydown = e => { if (e.key === 'Escape') cancel(); };
    rcStop.onclick = () => { const t = now(), el = t - t0; clipLen = Math.max(1, Math.round(el));
      const src = samples.length ? samples : [.4], out = [...Array(NC)].map((_,i) => { const a = Math.floor(i/NC*src.length), b = Math.max(a + 1, Math.floor((i + 1)/NC*src.length)); return Math.max(...src.slice(a, b)); });
      const top = Math.max(...out) || 1;
      cb.forEach((_,i) => { const from = 4 + hist[Math.min(NL - 1, Math.floor(i/NC*NL))]*32, to = 4 + clamp(out[i]/top, .12, 1)*32; ch[i].jump(from); if (REDUCE) ch[i].jump(to); else ch[i].set(to, S.soft, t + i*.012); });
      len.textContent = AU_FMT(clipLen); pp = 0; playing = false; icon.jump(0); go('clip', target(), t); say(`Clip saved, ${AU_FMT(clipLen)}`); rcPlay.focus({ preventScroll:true }); };
    rcPlay.onclick = () => { const t = now(); if (!playing){ if (pp >= 1) pp = 0; pt0 = t - pp*clipLen; playing = true; } else { pp = clamp((t - pt0)/clipLen); playing = false; } if (REDUCE) icon.jump(playing ? 1 : 0); else icon.set(playing ? 1 : 0); rcPlay.setAttribute('aria-label', playing ? 'Pause clip' : 'Play clip'); };
    rcDel.onclick = () => { playing = false; pp = 0; icon.jump(0); go('idle', 56, now()); say('Clip deleted'); rcMic.focus({ preventScroll:true }); };
    return t => {
      if (state === 'rec'){ const el = t - t0, lv = AU_LEVEL(el), s = Math.floor(el*14);
        if (s !== lastS){ lastS = s; hist.push(lv); hist.shift(); samples.push(lv); }
        const n = Math.floor(el); if (n !== sec){ sec = n; dm.set(String(Math.floor(n/60)), REDUCE); ds.set(String(n%60).padStart(2,'0'), REDUCE); }
        lb.forEach((b,i) => { b.style.height = px(4 + hist[i]*32); }); }
      dm.render(t); ds.render(t);
      const w = width.at(t); pill.style.width = px(Math.max(56, w)); pill.style.borderRadius = '28px';
      sw.apply(recEl, 'rec', t); sw.apply(clipEl, 'clip', t); mic.apply(rcMic, 'idle', t);
      if (state === 'clip'){ if (playing && t - pt0 >= clipLen){ playing = false; pp = 1; if (REDUCE) icon.jump(0); else icon.set(0); rcPlay.setAttribute('aria-label', 'Play clip'); }
        const p = playing ? clamp((t - pt0)/clipLen) : pp;
        cb.forEach((b,i) => { b.style.height = px(Math.max(3, ch[i].at(t))); b.style.background = mix(clamp(p*NC - i), 'var(--ink)', 'var(--raised)'); }); }
      ic.setAttribute('d', AU_ICON(clamp(icon.at(t))));
    };
  }});

atom({ id:'audio-transcript', cat:'Audio', name:'Transcript follow-along', block:'audio, transcript, captions', fam:['M','T'],
  html:`<div class="card col" style="width:min(340px,94%);padding:14px;gap:10px"><div class="row" style="gap:10px"><button class="tr-pp" aria-label="Play" style="${AU_BTN}background:var(--ink);color:var(--card)"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path class="tr-ic"/></svg></button><div style="flex:1;min-width:0"><div class="row small muted num" style="justify-content:space-between"><span class="tr-t">0:00</span><span class="tr-d"></span></div><div style="height:4px;border-radius:2px;background:var(--raised);overflow:hidden;margin-top:4px"><i class="tr-bar" style="display:block;height:100%;width:0;background:var(--accent)"></i></div></div></div><p class="tr-txt" style="position:relative;margin:0;font-size:16px;line-height:2.3;color:var(--muted)"></p></div><div class="hint">Press play and the pill follows the voice. Tap or Tab to any word to jump there</div>`,
  desc:'A highlight pill glides from word to word as a simulated clock plays, taking each word\'s own box so it stretches across long and short words. Tapping any word moves the clock there and keeps playing.',
  api:'i = last word with start ≤ clock   pill.{x,y,w,h}.set(word.box)   word click: p0 = start[i]',
  init(st){
    const TEXT = 'Okay so the plan is to ship the new onboarding on Thursday, then walk support through the changes on Friday morning.';
    const trPlay = $(st,'button.tr-pp');
    const path = $(st,'.tr-ic'), txt = $(st,'.tr-txt'), tt = $(st,'.tr-t'), bar = $(st,'.tr-bar');
    const words = TEXT.split(' '), starts = []; let acc = .3;
    words.forEach(w => { starts.push(acc); acc += .17 + .04*w.length + (/[,.]$/.test(w) ? .3 : 0); });
    const TOTAL = acc; $(st,'.tr-d').textContent = AU_FMT(TOTAL);
    const pill = AU_EL('span', 'position:absolute;left:0;top:0;border-radius:10px;background:color-mix(in oklab, var(--accent) 20%, transparent);pointer-events:none;opacity:0'); txt.appendChild(pill);
    function mkWord(w, i){ const trWord = AU_EL('button', 'position:relative;display:inline-block;border:0;background:none;padding:0 3px;margin:0;font:inherit;color:inherit;cursor:pointer;line-height:inherit;min-height:36px', w); trWord.type = 'button'; trWord.onclick = () => { const t = now(); p0 = starts[i] + .01; t0 = t; ended = false; setPlay(true); focusWord(i, t); }; txt.appendChild(trWord); txt.appendChild(document.createTextNode(' ')); return trWord; }
    const trWords = words.map(mkWord);
    const px_ = new Track(0, S.base), py = new Track(0, S.base), pw = new Track(0, S.base), ph = new Track(0, S.base), po = new Track(0, S.snap), ic = new Track(0, S.snap);
    let playing = false, p0 = 0, t0 = 0, cur = -1, ended = false;
    const pos = t => playing ? Math.min(TOTAL, p0 + (t - t0)) : p0;
    const idxAt = p => { let k = -1; starts.forEach((s,i) => { if (p >= s) k = i; }); return k; };
    const focusWord = (k, t) => { if (k === cur) return; cur = k;
      trWords.forEach((b,i) => { b.style.color = i < k ? 'var(--ink)' : i === k ? 'var(--ink)' : 'var(--muted)'; b.style.fontWeight = i === k ? '600' : '400'; if (i === k) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      if (k < 0){ po.set(0, S.snap, t); return; }
      const b = trWords[k], fresh = po.target === 0;
      if (REDUCE || fresh){ px_.jump(b.offsetLeft); py.jump(b.offsetTop); pw.jump(b.offsetWidth); ph.jump(b.offsetHeight); }
      else { px_.set(b.offsetLeft, S.base, t); py.set(b.offsetTop, S.base, t); pw.set(b.offsetWidth, S.base, t); ph.set(b.offsetHeight, S.base, t); }
      po.set(1, S.snap, t); };
    const setPlay = on => { playing = on; trPlay.setAttribute('aria-label', on ? 'Pause' : ended ? 'Replay' : 'Play'); if (REDUCE) ic.jump(on ? 1 : 0); else ic.set(on ? 1 : 0); };
    trPlay.onclick = () => { const t = now(); if (playing){ p0 = pos(t); setPlay(false); } else { if (ended || p0 >= TOTAL){ p0 = 0; ended = false; } t0 = t; setPlay(true); } };
    return t => {
      if (playing && p0 + (t - t0) >= TOTAL){ p0 = TOTAL; ended = true; setPlay(false); }
      const p = pos(t); focusWord(idxAt(p), t);
      path.setAttribute('d', AU_ICON(clamp(ic.at(t))));
      pill.style.opacity = clamp(po.at(t)).toFixed(3); pill.style.width = px(Math.max(0, pw.at(t))); pill.style.height = px(Math.max(0, ph.at(t))); pill.style.transform = `translate(${px(px_.at(t))},${px(py.at(t))})`;
      bar.style.width = (p/TOTAL*100).toFixed(2) + '%'; tt.textContent = AU_FMT(p);
    };
  }});

atom({ id:'audio-room', cat:'Audio', name:'Audio room', block:'audio, room, speakers', fam:['M','S','E','T'], tall:true,
  html:`<div class="card col" style="width:min(340px,94%);padding:12px;gap:10px"><div class="row" style="justify-content:space-between"><b style="font-size:15px;font-weight:600">Product sync</b><span class="small muted rm-n" aria-live="polite"></span></div><div class="rm-grid" role="group" aria-label="People in the room" style="position:relative;height:168px"></div><div class="row" style="flex-wrap:wrap;gap:8px"><button class="rm-join" style="min-height:44px;padding:0 14px;border:0;border-radius:10px;background:var(--ink);color:var(--card);font-size:13px;font-weight:500;cursor:pointer">Someone joins</button><button class="rm-leave" style="min-height:44px;padding:0 14px;border:0;border-radius:10px;background:var(--raised);color:var(--ink);font-size:13px;font-weight:500;cursor:pointer">Someone leaves</button><button class="rm-hand" aria-pressed="false" style="min-height:44px;padding:0 14px;border:0;border-radius:10px;background:var(--raised);color:var(--ink);font-size:13px;font-weight:500;cursor:pointer">Raise hand</button></div></div><div class="hint">Tap a person to mute them. Join and leave re-flow the grid on a spring</div>`,
  desc:'Speaker tiles breathe with simulated voice levels. A join springs every tile to its new slot, raising a hand pops a badge past its rest size, and muting draws a slash across the mic while the ring settles.',
  api:'slot(i, n): cols = n≤3 ? n : n≤4 ? 2 : 3   tile.{x,y,w,h}.set(slot)   ring = 1 + 0.45·smooth(level)',
  init(st){
    const grid = $(st,'.rm-grid'), count = $(st,'.rm-n');
    const rmJoin = $(st,'button.rm-join');
    const rmLeave = $(st,'button.rm-leave');
    const rmHand = $(st,'button.rm-hand');
    const PEOPLE = ['Ava','Ben','You','Cy','Dee','Eli','Fay'], HUES = ['var(--accent)','var(--success)','var(--ink)','var(--danger)','var(--warning)','var(--muted)','var(--accent)'], MAX = 7;
    const POP = { w:22, z:.5 };
    let tiles = [], leaving = [], nextName = 0, last = 0;
    const slot = (i, n) => { const W = size(grid).cw || 316, H = 168, gap = 8, cols = n <= 3 ? n : n <= 4 ? 2 : 3, rows = Math.ceil(n/cols);
      const w = (W - gap*(cols - 1))/cols, h = clamp((H - gap*(rows - 1))/rows, 72, 110), r = Math.floor(i/cols), c = i % cols, inRow = r === rows - 1 ? n - r*cols : cols;
      const off = (cols - inRow)*(w + gap)/2; return { x:c*(w + gap) + off, y:r*(h + gap), w, h }; };
    const relayout = (t, jump) => tiles.forEach((tl, i) => { const s = slot(i, tiles.length); const set = (tr, v) => (jump || REDUCE) ? tr.jump(v) : tr.set(v, S.base, t); set(tl.x, s.x); set(tl.y, s.y); set(tl.w, s.w); set(tl.h, s.h); });
    function add(name, idx, t, instant){
      const rmTile = AU_EL('button', 'position:absolute;left:0;top:0;border:0;border-radius:14px;background:var(--raised);color:var(--ink);padding:0;cursor:pointer;overflow:visible;transform-origin:50% 50%',
        `<span class="ring" style="position:absolute;left:50%;top:14px;width:44px;height:44px;margin-left:-22px;border-radius:50%;background:var(--accent);opacity:0;pointer-events:none"></span><span style="position:absolute;left:50%;top:14px;width:44px;height:44px;margin-left:-22px;border-radius:50%;display:grid;place-items:center;font:600 16px var(--sans);color:var(--card);background:${HUES[idx % HUES.length]}">${name[0]}</span><span style="position:absolute;left:0;right:0;bottom:8px;text-align:center;font-size:12px;line-height:1.2">${name}</span><svg class="mu" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="position:absolute;left:8px;top:8px"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/><path class="sl" d="M4 4L20 20" pathLength="1" stroke="var(--danger)" stroke-width="2.4" stroke-dasharray="1" stroke-dashoffset="1"/></svg><span class="hd" aria-hidden="true" style="position:absolute;right:6px;top:4px;font-size:16px;line-height:1">✋</span>`);
      const tl = { name, idx, el:rmTile, ring:$(rmTile,'.ring'), sl:$(rmTile,'.sl'), mu:$(rmTile,'.mu'), hd:$(rmTile,'.hd'), x:new Track(0), y:new Track(0), w:new Track(100), h:new Track(100), sc:new Track(instant || REDUCE ? 1 : 0, S.base), msl:new Track(0, S.snap), hand:new Track(0, POP), muted:false, up:false, s:0 };
      rmTile.setAttribute('aria-pressed', 'false'); rmTile.setAttribute('aria-label', `Mute ${name}`);
      rmTile.onclick = () => { tl.muted = !tl.muted; tl.msl.set(tl.muted ? 1 : 0); rmTile.setAttribute('aria-pressed', String(tl.muted)); rmTile.setAttribute('aria-label', `${tl.muted ? 'Unmute' : 'Mute'} ${name}`); };
      grid.appendChild(rmTile); tiles.push(tl);
      const s = slot(tiles.length - 1, tiles.length); tl.x.jump(s.x); tl.y.jump(s.y); tl.w.jump(s.w); tl.h.jump(s.h);
      if (!instant) tl.sc.set(1, S.base, t); return tl; }
    const status = () => { count.textContent = `${tiles.length} here`; rmJoin.disabled = tiles.length >= MAX; rmLeave.disabled = tiles.length <= 2; rmJoin.style.opacity = rmJoin.disabled ? '.45' : '1'; rmLeave.style.opacity = rmLeave.disabled ? '.45' : '1'; };
    PEOPLE.slice(0, 3).forEach((n,i) => add(n, i, 0, true)); nextName = 3; relayout(0, true); status();
    rmJoin.onclick = () => { if (tiles.length >= MAX) return; const t = now(); add(PEOPLE[nextName++ % PEOPLE.length], nextName, t, false); relayout(t); status(); };
    rmLeave.onclick = () => { if (tiles.length <= 2) return; const t = now(), tl = tiles.pop(); leaving.push(tl); tl.msl.jump(0); tl.sc.set(0, S.base, t); setTimeout(() => { tl.el.remove(); leaving = leaving.filter(x => x !== tl); }, REDUCE ? 60 : 700); relayout(t); status(); };
    rmHand.onclick = () => { const me = tiles.find(x => x.name === 'You') || tiles[0]; me.up = !me.up; me.hand.set(me.up ? 1 : 0, me.up && !REDUCE ? POP : S.snap); rmHand.setAttribute('aria-pressed', String(me.up)); rmHand.textContent = me.up ? 'Lower hand' : 'Raise hand'; };
    return t => { const dt = Math.min(.1, Math.max(0, t - last)); last = t;
      for (const tl of tiles.concat(leaving)){
        const gate = clamp((Math.sin(t*.6 + tl.idx*2.3) + .25)*1.6), raw = tl.muted ? 0 : AU_LEVEL(t*.9 + tl.idx*3.7)*gate;
        tl.s += (raw - tl.s)*(1 - Math.exp(-dt*(REDUCE ? 40 : 12)));
        const e = tl.el, sc = Math.max(0, tl.sc.at(t));
        e.style.width = px(Math.max(0, tl.w.at(t))); e.style.height = px(Math.max(0, tl.h.at(t)));
        e.style.transform = `translate(${px(tl.x.at(t))},${px(tl.y.at(t))}) scale(${sc.toFixed(3)})`; e.style.opacity = clamp(sc).toFixed(3);
        const lv = REDUCE ? (raw > .25 ? .5 : 0) : tl.s; tl.ring.style.transform = `scale(${(1 + .5*lv).toFixed(3)})`; tl.ring.style.opacity = (lv > .02 ? .18 + .5*lv : 0).toFixed(3);
        tl.sl.setAttribute('stroke-dashoffset', (1 - clamp(tl.msl.at(t))).toFixed(3)); tl.mu.style.color = tl.muted ? 'var(--danger)' : 'var(--muted)';
        const h = Math.max(0, tl.hand.at(t)); tl.hd.style.transform = `scale(${h.toFixed(3)})`; tl.hd.style.opacity = clamp(h).toFixed(3);
      } };
  }});

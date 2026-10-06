atom({ id:'exhibit', cat:'Documents', name:'Exhibit upload', block:'upload, attachments, files', fam:['M'],
  html:`<div class="col" style="width:min(360px,92%);gap:8px;align-items:center"><div class="card col" style="width:100%;padding:14px 16px;gap:10px"><b style="font-size:15px">Exhibits · 1 of 3</b><button class="btn add" style="min-height:32px;border-radius:8px">Attach Exhibit B</button><div class="slot" style="overflow:hidden;height:0"><div class="row" style="gap:10px;align-items:center;padding:4px 0"><span style="display:grid;place-items:center;width:36px;height:36px;padding:0;border-radius:10px;background:var(--wash);font-size:16px;transform:translateY(1px)">📄</span><div class="col" style="flex:1;gap:6px"><div class="row" style="gap:8px;align-items:center"><span style="font-size:13.5px">Exhibit-B.pdf</span><span class="st small muted" style="font-size:12px">uploading…</span></div><div style="height:6px;border-radius:3px;background:var(--wash);overflow:hidden"><div class="fill" style="height:100%;width:0;border-radius:3px;background:var(--accent)"></div></div></div><svg class="ck" width="20" height="20" viewBox="0 0 20 20"><path d="M4 10l4 4 8-9" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"/></svg><button class="btn retry" style="min-height:32px;border-radius:8px">Retry</button></div></div><div class="msg small" style="position:relative;height:22px;font-size:12.5px"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="fail"> simulate failed upload</label></div><div class="hint">Attach it — toggle failure to feel retry</div>`,
  desc:'The row opens its height first, the bar fills, and only then does the success check ink — or the row rings danger with a retry. Success holds an attached terminal; retry replays the fill.',
  api:'row.h.set(full, base) opens   bar.set(100, soft) fills   ok: ck.set(1) / err: retry Swap',
  init(st){
    const slot = $(st,'.slot'), fill = $(st,'.fill'), status = $(st,'.st'), ck = $(st,'.ck path'), retry = $(st,'.retry'), msg = $(st,'.msg'), fail = $(st,'.fail');
    const h = new Track(0), bar = new Track(0), ckT = new Track(0), sw = new Swap(0), fin = new Swap(0);
    const LEN = 24; let full = 0, busy = false, tok = 0;
    const F = ['Exhibit A attached', 'Exhibit B attached ✓', 'Upload failed — check the file and retry'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.style.justifyContent = 'flex-start'; el.textContent = s; msg.appendChild(el); return el; });
    retry.style.display = 'none'; ck.style.opacity = 0;
    const measure = () => { slot.style.height = 'auto'; full = slot.scrollHeight; };
    const run = () => { if (busy) return; busy = true; const my = ++tok; measure();
      h.set(full, S.base); bar.jump(0); ckT.jump(0); retry.style.display = 'none'; fin.to(0); status.textContent = 'uploading…';
      bar.set(100, S.soft);
      setTimeout(() => { if (my !== tok) return; busy = false;
        if (fail.checked){ status.textContent = 'failed'; retry.style.display = ''; fin.to(2); slot.style.boxShadow = '0 0 0 2px color-mix(in oklab, var(--danger) 40%, transparent)'; slot.style.borderRadius = '8px'; }
        else { status.textContent = 'done'; ckT.set(1, S.base); fin.to(1); slot.style.boxShadow = 'none'; } }, 1400); };
    $(st,'.add').onclick = run; retry.onclick = run;
    return t => { slot.style.height = px(Math.max(0, h.at(t)));
      const p = clamp(bar.at(t), 0, 100); fill.style.width = p.toFixed(1) + '%';
      fill.style.background = mix(clamp(p / 100), fail.checked && p > 99 ? 'var(--danger)' : 'var(--success)', 'var(--accent)');
      ck.style.strokeDasharray = LEN; ck.style.strokeDashoffset = ((1 - clamp(ckT.at(t))) * LEN).toFixed(2); ck.style.opacity = clamp(ckT.at(t)) > 0.02 ? 1 : 0;
      F.forEach((el,k) => fin.apply(el,k,t)); F[1].style.color = 'var(--success)'; F[2].style.color = 'var(--danger)'; };
  }});

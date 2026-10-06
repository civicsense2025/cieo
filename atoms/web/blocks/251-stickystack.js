

atom({ id:'stickystack', cat:'Layout', name:'Sticky stacking', block:'list, timeline, feed', fam:['D','M'], wide:true, tall:true,
  html:`<div class="col" style="gap:12px;align-items:center"><div style="max-width:420px;text-align:center"><b style="font-size:15px;font-weight:600;line-height:1.45">Sticky stacking</b><p class="muted" style="font-size:13px;line-height:1.5;margin:6px 0 0">Headers pin to the top one to one, then the next section pushes them off. The marker trails a beat behind.</p></div><div class="row small muted" style="gap:8px;align-items:center"><span class="sa" style="position:relative;display:inline-block;min-width:110px;min-height:20px"></span></div><div class="sk card" style="position:relative;width:min(340px,92%);height:200px;overflow-y:auto;padding:0 0 14px"><i class="ind" style="position:sticky;top:0;display:block;height:3px;border-radius:2px;background:var(--ink);margin:0 14px"></i><div class="secs"></div><div class="small muted" style="padding:12px 16px 0;font-size:12px">End of sections · stack holds</div></div><div class="row" style="gap:8px;align-items:center"><button class="btn bTop" style="min-height:32px">Back to top</button><label class="row small muted" style="gap:6px;align-items:center;cursor:pointer"><input type="checkbox" class="tr" checked> trailing edge</label></div></div><div class="hint">Scroll the stack through all three sections</div>`,
  desc:'Sticky headers pin and push off one to one while the section name swaps over and a marker trails 60ms behind. Reaching the end holds a done state.',
  api:'header: position sticky (1:1 pin, push-off)   sa.to(active) after exit   edge.go(x) trails .06',
  init(st){
    const box = $(st,'.sk'), secs = $(st,'.secs'), ind = $(st,'.ind'), sw = new Swap(0), e = edges(0, 60);
    const L = ['Morning','Afternoon','Evening','Done'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.textContent = s; $(st,'.sa').appendChild(el); return el; });
    const rows = [['Standup','Review'],['Ship','Retro'],['Plan','Rest']];
    const heads = L.slice(0, 3).map((_, i) => { const sec = document.createElement('div');
      const hd = document.createElement('div');
      hd.style.cssText = 'position:sticky;top:3px;z-index:2;background:var(--card);padding:8px 16px;font-size:13px;font-weight:600;line-height:1.5;border-bottom:1px solid var(--line)';
      hd.textContent = ['Morning','Afternoon','Evening'][i]; sec.appendChild(hd);
      rows[i].forEach((r, j) => { const d = document.createElement('div'); d.className = 'small';
        d.style.cssText = 'padding:10px 16px;font-size:13px;line-height:1.5' + (j > 0 ? ';border-top:1px solid var(--line)' : '');
        d.textContent = r; sec.appendChild(d); });
      secs.appendChild(sec); return hd; });
    let cur = -1; sw.to(0);
    const mark = k => { const x0 = k*70, dead = REDUCE || !$(st,'.tr').checked;
      if (dead) e.jump(x0, x0+60); else e.go(x0, x0+60); };
    box.onscroll = () => { const y = box.scrollTop; let k = 0;
      heads.forEach((hd, i) => { if (hd.offsetTop - 20 <= y + 4) k = i; });
      const end = y + box.clientHeight >= box.scrollHeight - 4;
      const want = end ? 3 : k;
      if (want !== cur){ cur = want; sw.to(want); mark(Math.min(want, 2)); } };
    $(st,'.bTop').onclick = () => box.scrollTo({ top:0, behavior: REDUCE ? 'auto' : 'smooth' });
    cur = 0; e.jump(0, 60);
    return t => { L.forEach((el, k) => sw.apply(el, k, t));
      const a = e.A.at(t), b = e.B.at(t); ind.style.transform = `translateX(${px(14 + a)})`; ind.style.width = px(Math.max(8, b - a)); };
  }});

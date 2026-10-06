atom({ id:'exportflow', cat:'Documents', name:'Export flow', block:'export, progress, share', fam:['M'],
  html:`<div class="col" style="width:min(340px,92%);gap:8px;align-items:center"><div class="card col" style="width:100%;padding:14px 16px;gap:12px;align-items:center"><b style="font-size:15px">Contract.pdf · 2.4 MB</b><div class="slot" style="position:relative;height:36px;width:100%;display:grid;place-items:center"><button class="btn go" style="min-height:32px;border-radius:8px">Export PDF</button></div><div class="track" style="position:relative;height:8px;width:100%;border-radius:4px;background:var(--wash);overflow:hidden"><div class="fill" style="position:absolute;inset:0 auto 0 0;width:0;border-radius:4px;background:var(--accent)"></div></div><div class="msg small" style="position:relative;height:22px;font-size:12.5px;line-height:1.5"></div></div><label class="row small muted" style="gap:6px;font-size:12px"><input type="checkbox" class="ann" checked> include annotations</label></div><div class="hint">Export, watch it creep, then pop done</div>`,
  desc:'The button swaps to a spinner, the bar creeps toward ninety percent on a lazy spring, then springs to full. The pill swaps to a success terminal that holds until the next export.',
  api:'go: btn.to(1)   bar.set(90, lazy) then .set(100, base)   done: pill.to(2) success',
  init(st){
    const slot = $(st,'.slot'), fill = $(st,'.fill'), msg = $(st,'.msg'), go = $(st,'.go'), ann = $(st,'.ann');
    const bar = new Track(0), sw = new Swap(0), pill = new Swap(0);
    const spin = document.createElement('span'); spin.className = 'layer'; spin.innerHTML = '<span class="spin" style="display:inline-block">◌</span> Exporting…';
    const doneEl = document.createElement('span'); doneEl.className = 'layer'; doneEl.style.cssText = 'background:var(--success);color:#fff;border-radius:999px;padding:6px 14px;font-size:13px'; doneEl.textContent = 'Exported ✓';
    const BL = [go, spin, doneEl]; slot.append(spin, doneEl);
    const M = ['Ready to export', 'Writing pages…', 'Saved to Downloads ✓'].map(s => { const el = document.createElement('span'); el.className = 'layer'; el.textContent = s; msg.appendChild(el); return el; });
    let busy = false, tok = 0;
    go.onclick = () => { if (busy) return; busy = true; const my = ++tok; pill.to(1); sw.to(1); bar.jump(0); bar.set(90, S.lazy);
      const spinEl = spin.querySelector('.spin'); const t0 = performance.now();
      const tick = () => { if (my !== tok) return; spinEl.style.transform = `rotate(${((performance.now() - t0) / 3).toFixed(0)}deg)`;
        if (bar.at(now()) < 89.5) requestAnimationFrame(tick); };
      tick();
      setTimeout(() => { if (my !== tok) return; bar.set(100, S.base); pill.to(2); sw.to(2);
        setTimeout(() => { if (my !== tok) return; busy = false; pill.to(0); sw.to(0); bar.jump(0); }, 2600); }, ann.checked ? 2100 : 1500); };
    return t => { BL.forEach((el,k) => pill.apply(el,k,t)); M.forEach((el,k) => sw.apply(el,k,t));
      const p = clamp(bar.at(t), 0, 100); fill.style.width = p.toFixed(1) + '%';
      fill.style.background = mix(clamp(p / 100), 'var(--success)', 'var(--accent)'); M[2].style.color = 'var(--success)'; };
  }});

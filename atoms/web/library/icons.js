// Catalogue chrome uses a small original stroke family. Recipe SVGs stay intact.
L.icons = {
 grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
 search:'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM16 16l5 5',
 bookmark:'M6 3h12v18l-6-4-6 4z',
 sliders:'M4 6h16M4 18h16M8 3v6M16 15v6',
 close:'m6 6 12 12M6 18 18 6',
 arrow:'M5 12h14m-5-5 5 5-5 5',
 folder:'M3 7V5a2 2 0 0 1 2-2h5l3 4h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
 layers:'m12 3 10 6-10 6L2 9l10-6ZM2 13l10 6 10-6M2 17l10 6 10-6',
 pen:'m15 3 6 6-12 12H3v-6L15 3ZM12 6l6 6',
 play:'m8 4 12 8-12 8V4Z',
 pause:'M7 4v16M17 4v16',
 code:'m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18',
 expand:'M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5',
 copy:'M8 8h12v13H8zM16 8V3H3v13h5',
 info:'M12 11v6m0-10v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
 spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z',
 sidebar:'M3 4h18v16H3zM9 4v16',
 check:'m5 12 4 4L19 6',
 link:'m9 15 6-6M7 13l-2 2a4 4 0 0 0 6 6l3-3M17 11l2-2a4 4 0 0 0-6-6l-3 3',
};
L.icon = (name) => `<svg class="l-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${L.icons[name] || L.icons.grid}"/></svg>`;
L.iconButton = (name, label, action) => {
 const b=document.createElement('button'); b.type='button'; b.className='l-icon-button';
 b.setAttribute('aria-label',label); b.title=label; b.innerHTML=L.icon(name);
 if(action) b.addEventListener('click',action); return b;
};
L.escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
L.announce = message => {clearTimeout(L.messageTimer);L.get('l-status').textContent=message;L.messageTimer=setTimeout(()=>L.get('l-status').textContent='',3500)};
L.get = id => document.getElementById(id);

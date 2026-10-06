/* Original 20px stroke icons. No icon font, network, or framework dependency. */
window.CieoCatalogue = (() => {
  const paths = {
    search:'<circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/>',
    grid:'<rect x="3" y="3" width="5" height="5" rx="1"/><rect x="12" y="3" width="5" height="5" rx="1"/><rect x="3" y="12" width="5" height="5" rx="1"/><rect x="12" y="12" width="5" height="5" rx="1"/>',
    bookmark:'<path d="M5 3h10v14l-5-3-5 3z"/>',
    settings:'<path d="M3 6h5m4 0h5M3 14h9m4 0h1"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="14" r="2"/>',
    sidebar:'<rect x="2.5" y="3" width="15" height="14" rx="3"/><path d="M8 3v14"/>',
    close:'<path d="m5 5 10 10M15 5 5 15"/>',
    code:'<path d="m6 5-5 5 5 5m8-10 5 5-5 5m-3-12-2 14"/>',
    pause:'<path d="M7 4v12m6-12v12"/>',
    play:'<path d="m6 3 10 7-10 7z"/>',
    copy:'<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 7V3H3v9h4"/>',
    expand:'<path d="M12 3h5v5M8 17H3v-5m0 5 6-6m8-8-6 6"/>',
    arrow:'<path d="M3 10h13m-5-5 5 5-5 5"/>',
    layers:'<path d="m10 2 8 5-8 5-8-5zM2 11l8 5 8-5M4 16l6 3 6-3"/>',
    pen:'<path d="m12 3 5 5-9 9H3v-5zM10 5l5 5"/>',
    image:'<rect x="2" y="3" width="16" height="14" rx="3"/><circle cx="7" cy="7" r="1"/><path d="m3 15 5-5 3 3 3-3 4 4"/>',
    dot:'<circle cx="10" cy="10" r="3"/>',
    check:'<path d="m4 10 4 4 8-8"/>'
  };
  const icon = (name) => `<svg class="ui-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.dot}</svg>`;
  const paintIcons = (root=document) => root.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
  let noticeTimer;
  const announce = (message) => {
    document.getElementById('announcer').textContent = message;
    const toast = document.getElementById('toast'); toast.textContent = message; toast.hidden = false;
    clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { toast.hidden=true; }, 2800);
  };
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } };
  return { icon, paintIcons, announce, read, save, frames:new Set(), reduced:matchMedia('(prefers-reduced-motion:reduce)').matches, paused:false, active:null };
})();

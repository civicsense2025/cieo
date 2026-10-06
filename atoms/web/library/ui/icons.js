/* Original, editable 24-unit line icons. No font or external asset dependency. */
(() => {
  const L = window.CieoLibrary = window.CieoLibrary || {};
  const paths = {
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h10"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    spark:'<path d="m12 3 2.8 6.2L21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8Z"/>',
    bookmark:'<path d="M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4-6 4Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    sliders:'<path d="M4 7h5m5 0h6M4 17h10m5 0h1"/><circle cx="11.5" cy="7" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>',
    pause:'<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    play:'<path d="m8 4 12 8-12 8Z"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 2.5M12 17h.01"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  };
  L.icon = name => `<svg class="lib-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
  L.paintIcons = root => root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = L.icon(el.dataset.icon); });
  const artworks = {
    essentials:'<rect x="7" y="9" width="46" height="38" rx="10" fill="#fff"/><rect x="14" y="18" width="32" height="9" rx="4.5" fill="#b9a7eb"/><rect x="14" y="32" width="21" height="4" rx="2" fill="#dcdae7"/><circle cx="45" cy="46" r="10" fill="#745bc1"/><path d="m41 46 3 3 5-6" stroke="#fff" stroke-width="2" fill="none"/>',
    writing:'<rect x="12" y="6" width="37" height="49" rx="6" fill="#fff" transform="rotate(-8 30 30)"/><path d="m22 37 8-21 8 21m-13-7h10" stroke="#8d6b20" stroke-width="2.5" fill="none"/><path d="M20 44h23" stroke="#dfd1a9" stroke-width="2"/>',
    design:'<rect x="10" y="10" width="40" height="40" rx="12" fill="#bccee9"/><path d="M18 17h25v25H18z" fill="#fff" stroke="#547eb7"/><path d="M15 14h6v6h-6zm25 0h6v6h-6zM15 39h6v6h-6zm25 0h6v6h-6z" fill="#547eb7"/>',
    agents:'<circle cx="30" cy="30" r="23" fill="#fff"/><path d="M17 27a13 13 0 0 1 26 0v12H17Z" fill="#dfa78b"/><circle cx="25" cy="29" r="2" fill="#633c2b"/><circle cx="35" cy="29" r="2" fill="#633c2b"/><path d="M26 36h8M30 12v5" stroke="#633c2b" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="11" r="3" fill="#dfa78b"/>',
  };
  L.art = key => `<svg viewBox="0 0 60 60" aria-hidden="true">${artworks[key] || artworks.essentials}</svg>`;
})();

/* Original, editable 24px glyphs. Decorative SVGs never become extra tab stops. */
window.CieoLibrary = window.CieoLibrary || {};
(() => {
  const L = window.CieoLibrary;
  const paths = {
    grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    layers:'m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
    search:'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm5-1 5 5',
    star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
    menu:'M4 6h16M4 12h16M4 18h16', close:'m6 6 12 12M6 18 18 6',
    tune:'M4 6h10m4 0h2M4 12h3m4 0h9M4 18h10m4 0h2M14 3v6M7 9v6m7 0v6',
    arrow:'M5 12h14m-5-5 5 5-5 5', expand:'M14 4h6v6m0-6-7 7M10 20H4v-6m0 6 7-7',
    code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
    copy:'M9 8h11v13H9zM5 16H3V3h11v2', check:'m5 12 4 4L19 6',
    pause:'M8 5v14M16 5v14', play:'m8 5 11 7-11 7V5Z',
    folder:'M3 7V5h6l2 2h10v13H3V7Z', keyboard:'M3 6h18v13H3zM6 10h1m3 0h1m3 0h1m3 0h1M6 14h1m3 0h7',
    pen:'m15 3 6 6-12 12H3v-6L15 3Zm-10 12 4 4m4-14 6 6',
    image:'M3 3h18v18H3zM3 16l5-5 5 5 4-4 4 4M16 7h.01',
    inputs:'M4 5h16v6H4zM4 16h9m4 0h3M13 13v6',
    window:'M3 4h18v16H3zM3 9h18m-12 0v11',
    circle:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0v18M3 12h18',
    motion:'M3 16h4V8h4v8h4V8h6', back:'m14 6-6 6 6 6',
    sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
    link:'m9 15 6-6M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 10a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1',
  };
  L.icon = (name) => `<svg class="lib-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name] || paths.layers}"/></svg>`;
  L.escape = (text) => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  L.button = (icon, label, attrs = '') => `<button type="button" class="lib-icon-button" aria-label="${L.escape(label)}" title="${L.escape(label)}" ${attrs}>${L.icon(icon)}</button>`;
})();

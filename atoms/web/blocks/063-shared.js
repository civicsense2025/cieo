
const outside = (st, els, fn) => st.addEventListener('pointerdown', e => { if (!els.some(x => x.contains(e.target))) fn(); });
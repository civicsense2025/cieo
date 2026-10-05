

/* ---------- Jobs: writing, designing, email ---------- */
const relRect = (st, r) => { const s = st.getBoundingClientRect(); return { x:r.left - s.left, y:r.top - s.top, w:r.width, h:r.height }; };
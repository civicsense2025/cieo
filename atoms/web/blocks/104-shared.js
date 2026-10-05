
const wordSpans = (el, text) => { el.innerHTML = text.split(' ').map(w => `<span>${w}</span>`).join(' '); return $$(el,'span'); };
// site/roving-tabs.js: one tablist behavior for the whole site. Click or ArrowLeft/ArrowRight/Home/End selects a tab,
// only the selected tab is in the tab order, and `onSelect(index)` lets the page swap its panel.
export function rovingTabs(tabs, onSelect = () => {}) {
  const select = (index, { focus = false } = {}) => {
    tabs.forEach((tab, j) => {
      const on = index === j;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    onSelect(index);
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const next = e.key === 'ArrowRight' ? (i + 1) % n
        : e.key === 'ArrowLeft' ? (i - 1 + n) % n
        : e.key === 'Home' ? 0
        : e.key === 'End' ? n - 1
        : -1;
      if (next < 0) return;
      e.preventDefault();
      select(next, { focus: true });
    });
  });
  return select;
}

// Minimal, dependency-free Markdown → HTML for primitive READMEs: ## and ### headings, fenced code, paragraphs, "- " lists and
// inline `code` / **strong**. Everything is escaped first, so README text can never inject markup.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/** Sections a reader needs on the page; internal bookkeeping ("Evidence") stays in the repository. */
const SKIP = new Set(['evidence']);

export function readmeSections(md) {
  const sections = [];
  let cur = null;
  for (const line of md.replace(/\r/g, '').split('\n')) {
    const h = line.match(/^##\s+(.+)/);
    if (h) { cur = { title: h[1].trim(), lines: [] }; sections.push(cur); continue; }
    if (cur) cur.lines.push(line);
  }
  return sections.filter((s) => !SKIP.has(s.title.toLowerCase()) && s.lines.some((l) => l.trim()));
}

function blocks(lines) {
  const out = [];
  let list = null, para = [];
  const flush = () => {
    if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; }
    if (list) { out.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`); list = null; }
  };
  let fence = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (fence) { if (line.startsWith('```')) { out.push(`<pre><code>${esc(fence.join('\n'))}</code></pre>`); fence = null; } else fence.push(raw); continue; }
    if (line.startsWith('```')) { flush(); fence = []; continue; }
    const sub = line.match(/^###\s+(.+)/);
    if (sub) { flush(); out.push(`<h4>${inline(sub[1])}</h4>`); continue; }
    if (!line) { flush(); continue; }
    const li = line.match(/^[-*]\s+(.*)/);
    if (li) { if (para.length) flush(); (list ??= []).push(li[1]); continue; }
    if (list) flush();
    para.push(line);
  }
  if (fence) out.push(`<pre><code>${esc(fence.join('\n'))}</code></pre>`);
  flush();
  return out.join('');
}

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function readmeHtml(md) {
  return readmeSections(md).map((s) => `<section id="guide-${slug(s.title)}"><h3>${esc(s.title)}</h3>${blocks(s.lines)}</section>`).join('');
}

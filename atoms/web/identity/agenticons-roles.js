/* ---- agent role icons: 24 roles in the Meridian agent system ----
   Every role is a square tile (agents are square, people are round) with one glyph inside and a
   tilted equator underneath it, the same line the Meridian agent mark carries. Brand form: 64 grid,
   paper tile, one pale wash, 1.7 ink line. Product form: square outline in currentColor with the stroke
   weight tuned per size; at 16px the glyph is redrawn with fewer strokes and the equator is dropped. */
(() => {
const INK = '#1d1d1b', PAPER = '#faf7f2';
const WASHP = 'M14 52C19 21 45 12 55 20C49 44 34 55 14 52Z';
const WASH = { check:'#dce8fb', content:'#f1e4ff', ops:'#e2f1ea', people:'#fee8e0' };
const GROUPS = { check:'Check', content:'Content', ops:'Operate', people:'People' };
const EQ = 'M16 49.5L48 44.5';              // the equator cue: same tilt as the agent mark, sits under every glyph
const SMALL_MAX = 20;                        // product forms this size or smaller use the simplified drawing
const RICH_MIN = 48;                         // brand form and product forms this size or larger add the finest details
const SMALL_SHIFT = 6;                       // the simplified glyph drops the equator, so it moves down to centre
const swFor = s => s <= 16 ? 5.2 : s <= 20 ? 4.4 : s <= 24 ? 4 : s <= 32 ? 3 : s <= 48 ? 2.4 : 2;  // ≈1.3 to 1.5px on screen at every size
const f1 = v => +v.toFixed(2);
const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
// P(path, id, flags): f = filled; S = 16 and 20px drawing only; D = 24px and up; X = finest detail only (brand and 48px up)
const P = (d, id, fl = '') => ({ d, id, f:fl.includes('f'), D:fl.includes('D'), S:fl.includes('S'), X:fl.includes('X') });
const PT = (d, id, tf, fl = '') => ({ ...P(d, id, fl), tf });

/* mv entries: ids, k = draw (retrace) | move | rot | turn, amp, c (pivot), dx, dy, dl (delay, s) */
const ROLES = [
  { k:'review', name:'Review', grp:'check', alias:['pr','pull request','comments','pins','approve'],
    mean:'Reads a change or a page and leaves pinned comments.', act:'Reviewing /pricing',
    mt:'The check traces itself.',
    g:[P('M15 13H49V35H29L21 41V35H15Z','bb','D'), P('M24 24L30 30L40 18','ck','D'), P('M17 25L27 35L47 15','ck','S')],
    mv:[{ ids:['ck'], k:'draw' }] },
  { k:'accessibility', name:'Accessibility', grp:'check', alias:['a11y','wcag','contrast','screen reader','focus'],
    mean:'Checks contrast, focus order and labels against WCAG.', act:'Checking contrast on /signup',
    mt:'The filled half turns one full circle.',
    g:[P('M32 13.5A12.5 12.5 0 1 1 32 38.5A12.5 12.5 0 1 1 32 13.5Z','ci'), P('M32 13.5A12.5 12.5 0 0 0 32 38.5Z','half','f')],
    mv:[{ ids:['half'], k:'turn', amp:360, c:[32, 26] }] },
  { k:'copy-editor', name:'Copy editor', grp:'content', alias:['proofread','grammar','tone','edit','spelling'],
    mean:'Fixes spelling, tone and clarity without changing what you meant.', act:'Editing the launch post',
    mt:'The pencil presses toward its tip.',
    g:[P('M17 38L22.2 27.3L38.7 12.6L44.7 19.5L28.2 34.1Z','pen'), P('M22.2 27.3L28.2 34.1','pn','X')],
    mv:[{ ids:['pen', 'pn'], k:'move', dx:-3, dy:2.7 }] },
  { k:'brand-checker', name:'Brand checker', grp:'content', alias:['style guide','colors','logo','voice'],
    mean:'Compares colors, type and voice against the brand rules.', act:'Comparing colors to the guide',
    mt:'The drop traces, then the arc inside it.',
    g:[P('M32 12L39.77 23.03A9.5 9.5 0 1 1 24.23 23.03Z','dr','D'), P('M32 10L40.75 23.2A10.5 10.5 0 1 1 23.25 23.2Z','dr','fS'), P('M27.5 28C27.5 31 29 33.5 32 34.5','sh','X')],
    mv:[{ ids:['dr'], k:'draw' }, { ids:['sh'], k:'draw', dl:.2 }] },
  { k:'seo', name:'SEO', grp:'content', alias:['search','ranking','keywords','metadata','sitemap'],
    mean:'Audits titles, structure and links for search.', act:'Auditing titles on 41 pages',
    mt:'The lens leans in while the rank chevron traces.',
    g:[P(rr(15, 13, 22, 20, 7),'lens'), P('M34 31L46 39','hd'), P('M21 27L26 21.5L31 27','ch','X')],
    mv:[{ ids:['lens', 'hd'], k:'move', dx:2, dy:1.5 }, { ids:['ch'], k:'draw' }] },
  { k:'performance', name:'Performance', grp:'check', alias:['speed','lighthouse','core web vitals','load time'],
    mean:'Times page loads and flags the ones that got slower.', act:'Timing the homepage load',
    mt:'The needle sweeps right and settles.',
    g:[P('M15 33A17 17 0 0 1 49 33','ar'), P('M32 33L43 22','nd'), P('M32 33h.01','pv','S')],
    mv:[{ ids:['nd'], k:'rot', amp:40, c:[32, 33] }] },
  { k:'security', name:'Security', grp:'check', alias:['secrets','vulnerabilities','audit','keys','lock'],
    mean:'Scans for exposed keys and unsafe settings.', act:'Scanning for exposed keys',
    mt:'The shackle lifts and drops back.',
    g:[P('M25 21V18A7 7 0 0 1 39 18V21','sk','D'), P('M19 21H45V38H19Z','bd','D'), P('M25 22V16A7 7 0 0 1 39 16V22','sk','S'), P('M19 22H45V37H19Z','bd','S'), P('M32 27V31','kh','X')],
    mv:[{ ids:['sk'], k:'move', dy:-3.5 }] },
  { k:'link-checker', name:'Link checker', grp:'check', alias:['broken links','404','redirects','urls'],
    mean:'Follows every link and reports the ones that fail.', act:'Following 212 links',
    mt:'The two halves part and rejoin.',
    g:[PT('M28 21H22A5 5 0 0 0 22 31H28','a','rotate(-35 32 26)','D'), PT('M36 21H42A5 5 0 0 1 42 31H36','b','rotate(-35 32 26)','D'), PT('M25 26H39','bar','rotate(-35 32 26)','X'), PT('M28 19H22A7 7 0 0 0 22 33H28','a','rotate(-35 32 26)','S'), PT('M36 19H42A7 7 0 0 1 42 33H36','b','rotate(-35 32 26)','S')],
    mv:[{ ids:['a'], k:'move', dx:-3, dy:0 }, { ids:['b'], k:'move', dx:3, dy:0 }] },
  { k:'form-tester', name:'Form tester', grp:'check', alias:['inputs','validation','checkout','submit'],
    mean:'Fills in and submits forms to see what breaks.', act:'Submitting the contact form',
    mt:'The caret slides along the field.',
    g:[P(rr(15, 16, 34, 18, 4),'fld','D'), P('M24 21.5V28.5','cr','D'), P('M25 15H39M32 15V37M25 37H39','cr','S')],
    mv:[{ ids:['cr'], k:'move', dx:8, dy:0 }] },
  { k:'visual-regression', name:'Visual regression', grp:'check', alias:['screenshots','diff','pixels','snapshot'],
    mean:'Compares screenshots from before and after a change.', act:'Comparing 18 screenshots',
    mt:'The new square slides toward the old one.',
    g:[P(rr(15, 13, 21, 18, 3),'bk','D'), P(rr(29, 21, 20, 17, 3),'fr','D'), P('M39 30h4v4h-4Z','fp','fX'), P(rr(15, 13, 14, 14, 3),'bk','S'), P(rr(35, 26, 11, 11, 2),'fr','fS')],
    mv:[{ ids:['fr', 'fp'], k:'move', dx:-4, dy:-3 }] },
  { k:'translator', name:'Translator', grp:'content', alias:['localization','languages','i18n','spanish'],
    mean:'Translates content and keeps your terms consistent.', act:'Translating to Spanish',
    mt:'The two arrows trade places.',
    g:[P('M16 19H44M38 13L44 19L38 25','t','D'), P('M48 32H20M26 26L20 32L26 38','b','D'), P('M16 19H44M39 14L44 19L39 24','t','S'), P('M48 33H20M25 28L20 33L25 38','b','S')],
    mv:[{ ids:['t'], k:'move', dx:4, dy:0 }, { ids:['b'], k:'move', dx:-4, dy:0 }] },
  { k:'researcher', name:'Researcher', grp:'content', alias:['sources','citations','find','reading'],
    mean:'Finds sources for a question and cites them.', act:'Reading 6 sources',
    mt:'The spine traces from top to bottom.',
    g:[P('M16 15.5C21 13.5 27 14.5 32 17.5C37 14.5 43 13.5 48 15.5V36.5C43 34.5 37 35.5 32 38.5C27 35.5 21 34.5 16 36.5Z','bk'), P('M32 17.5V38.5','sp'), P('M21 22C23.5 21 25.5 21.2 27 22M37 22C38.5 21.2 40.5 21 43 22','tx','X')],
    mv:[{ ids:['sp'], k:'draw' }] },
  { k:'summarizer', name:'Summarizer', grp:'content', alias:['tldr','digest','condense','brief'],
    mean:'Condenses long material to the points that matter.', act:'Condensing the 40-page report',
    mt:'Three lines retrace, longest first.',
    g:[P('M16 17H48','l1'), P('M16 26H40','l2','D'), P('M16 35H30','l3')],
    mv:[{ ids:['l1'], k:'draw' }, { ids:['l2'], k:'draw', dl:.06 }, { ids:['l3'], k:'draw', dl:.12 }] },
  { k:'data-analyst', name:'Data analyst', grp:'ops', alias:['charts','metrics','sql','report','numbers'],
    mean:'Turns tables into answers and charts.', act:'Grouping signups by week',
    mt:'The bars grow in turn.',
    g:[P('M20 40.5V29','b1','D'), P('M32 38.5V15','b2','D'), P('M44 36.5V23','b3','D'), P('M20 38V27','b1','S'), P('M32 38V15','b2','S'), P('M44 38V22','b3','S')],
    mv:[{ ids:['b1'], k:'draw' }, { ids:['b2'], k:'draw', dl:.07 }, { ids:['b3'], k:'draw', dl:.14 }] },
  { k:'scheduler', name:'Scheduler', grp:'ops', alias:['calendar','reminders','cron','plan','booking'],
    mean:'Plans runs and reminders around your calendar.', act:'Finding a slot on Thursday',
    mt:'The ring tabs retrace and the marker steps to the next day.',
    g:[P(rr(17, 16, 30, 22, 3),'cal'), P('M17 24H47','hd','D'), P('M25 12V19','tl'), P('M39 12V19','tr'), P('M32 31h.01M39 31h.01','dt','X'), P('M22.5 28.5h5v5h-5Z','mk','fX')],
    mv:[{ ids:['tl', 'tr'], k:'draw' }, { ids:['mk'], k:'move', dx:7, dy:0 }] },
  { k:'support', name:'Support', grp:'people', alias:['help desk','tickets','customers','chat','headset'],
    mean:'Answers customer questions and hands off when it is stuck.', act:'Answering 3 open tickets',
    mt:'The headband traces over the top.',
    g:[P('M16 29V25C16 17 23 12 32 12S48 17 48 25V29','bd'), P('M14 27H20V36H14Z','cl','f'), P('M44 27H50V36H44Z','cr','f'), P('M47 36C47 39 44.5 39.5 40 39.5','mc')],
    mv:[{ ids:['bd'], k:'draw' }] },
  { k:'designer', name:'Designer', grp:'people', alias:['layout','spacing','type','ui','pointer','cursor'],
    mean:'Drafts layouts and tunes spacing and type.', act:'Adjusting card spacing',
    mt:'The pointer slides toward its target and settles.',
    g:[P('M21 13V36L27 30.5L31 39L35.5 37L31.5 28.5H40Z','cu','D'), P('M21 13V36L27 30.5L31 39L35.5 37L31.5 28.5H40Z','cu','fS'), P(rr(34, 13, 12, 10, 2),'sq','D')],
    mv:[{ ids:['cu'], k:'move', dx:3, dy:2.5 }] },
  { k:'developer', name:'Developer', grp:'ops', alias:['code','engineer','branch','commit','programmer'],
    mean:'Writes and edits code on its own branch.', act:'Editing on branch fix/nav',
    mt:'The brackets open and close.',
    g:[P('M23 17L14.5 26L23 35','l'), P('M41 17L49.5 26L41 35','r'), P('M35 15L29 37','sl','D')],
    mv:[{ ids:['l'], k:'move', dx:-2.5, dy:0 }, { ids:['r'], k:'move', dx:2.5, dy:0 }] },
  { k:'qa-tester', name:'QA tester', grp:'check', alias:['tests','test cases','bugs','quality','e2e'],
    mean:'Runs through test cases and reports what failed.', act:'Running 24 test cases',
    mt:'The flask tips and settles.',
    g:[P('M27 13V23L18.5 37.5H45.5L37 23V13','fk','D'), P('M26 13V23L17 37.5H47L38 23V13','fk','S'), P('M24 13H40','rm'), P('M24.5 31.5L39.5 29','lq','D')],
    mv:[{ ids:['fk', 'rm', 'lq'], k:'rot', amp:7, c:[32, 30] }] },
  { k:'content-migrator', name:'Content migrator', grp:'ops', alias:['import','move','transfer','cms','export'],
    mean:'Moves content between systems and keeps its structure.', act:'Moving 120 posts',
    mt:'The arrow drops into the tray.',
    g:[P('M17 31V38H47V31','tr'), P('M32 13V30M25 23L32 30L39 23','ar')],
    mv:[{ ids:['ar'], k:'move', dx:0, dy:5 }] },
  { k:'moderator', name:'Moderator', grp:'people', alias:['flag','report','abuse','community','safety'],
    mean:'Flags content that breaks the rules and leaves the decision to a person.', act:'Reviewing 5 flagged comments',
    mt:'The flag traces out from the pole.',
    g:[P('M19 14H45L39.5 22L45 30H19','fl'), P('M19 14V39','po')],
    mv:[{ ids:['fl'], k:'draw' }] },
  { k:'onboarding-guide', name:'Onboarding guide', grp:'people', alias:['setup','welcome','tour','new user','steps'],
    mean:'Walks new people through setup one step at a time.', act:'Walking Sam through setup',
    mt:'The path traces from the first step to the last.',
    g:[P('M16 37C22 28 28 33 34 26C39 20 43 22 48 15','pa'), P('M12.5 33.5h7v7h-7Z','n1','f'), P('M44.5 11.5h7v7h-7Z','n2','f')],
    mv:[{ ids:['pa'], k:'draw' }] },
  { k:'release-manager', name:'Release manager', grp:'ops', alias:['version','tag','changelog','deploy','ship'],
    mean:'Tags versions, writes the notes and checks the release list.', act:'Preparing v2.4 notes',
    mt:'The tag swings from its hole.',
    g:[P('M15 14H33L48 26L33 38H15Z','tg'), P('M19.5 23.5H24.5V28.5H19.5Z','ho','fD'), P('M25 26h.01','ho','S')],
    mv:[{ ids:['tg', 'ho'], k:'rot', amp:-12, c:[22, 26] }] },
  { k:'archivist', name:'Archivist', grp:'ops', alias:['archive','records','storage','file','retention'],
    mean:'Files finished work and keeps it easy to find.', act:'Filing last quarter’s drafts',
    mt:'The lid lifts and closes.',
    g:[P(rr(15, 14, 34, 8, 2),'ld'), P('M18 22V37H46V22','bx'), P('M28 29H36','hn','X')],
    mv:[{ ids:['ld'], k:'move', dx:0, dy:-4 }] }
];

/* One drawing for the page and for the exported files.
   o: brand, size, tier (force a drawing tier), ids (layer ids, for files), mv (motion hooks, for the page), pretty, label */
function roleSvg(r, o = {}){
  const brand = !!o.brand, size = o.size || 64, tier = o.tier ?? (brand || size >= RICH_MIN ? 2 : size <= SMALL_MAX ? 0 : 1), small = tier === 0;  // 0 = 16/20px, 1 = 24/32px, 2 = brand and 48px up
  const sw = brand ? 1.7 : (o.sw || swFor(size)), ink = brand ? INK : 'currentColor', nl = o.pretty ? '\n' : '', ind = o.pretty ? '  ' : '';
  const dr = new Set(); (r.mv || []).forEach(m => m.k === 'draw' && m.ids.forEach(i => dr.add(i)));
  const it = x => `<path${o.ids && x.id ? ` id="${x.id}"` : ''}${o.mv && x.id ? ` data-m="${x.id}"` : ''} d="${x.d}"${x.f ? ` fill="${ink}"` : ''}${x.tf ? ` transform="${x.tf}"` : ''}${o.mv && dr.has(x.id) ? ' pathLength="1"' : ''}/>`;
  const gp = (id, kids, extra = '') => `<g${o.ids ? ` id="${id}"` : ''} fill="none" stroke="${ink}" stroke-width="${f1(sw)}" stroke-linecap="round" stroke-linejoin="round"${extra}>${nl}${kids.map(k => ind + ind + k).join(nl)}${nl}${ind}</g>`;
  const items = r.g.filter(x => small ? !x.D && !x.X : x.S ? false : x.X ? tier === 2 : true).map(it);
  const out = [];
  if (brand){
    out.push(`<g${o.ids ? ' id="tile"' : ''}><rect width="64" height="64" rx="16" fill="${PAPER}"/></g>`);
    out.push(`<g${o.ids ? ' id="wash"' : ''}><path d="${WASHP}" fill="${WASH[r.grp]}" opacity=".65"/></g>`);
  } else {
    out.push(`<g${o.ids ? ' id="tile"' : ''} fill="none" stroke="currentColor" stroke-width="${f1(sw)}"><rect x="${f1(sw/2 + 3)}" y="${f1(sw/2 + 3)}" width="${f1(58 - sw)}" height="${f1(58 - sw)}" rx="15"/></g>`);
  }
  out.push(gp('glyph', items, small ? ` transform="translate(0 ${SMALL_SHIFT})"` : ''));
  if (!small) out.push(gp('cue', [`<path${o.ids ? ' id="equator"' : ''} d="${EQ}"/>`]));
  const lab = o.label || `${r.name} agent`;
  const head = o.file
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${lab}"><title>${lab}</title>`
    : `<svg class="air-svg" viewBox="0 0 64 64" width="${size}" height="${size}" ${o.label ? `role="img" aria-label="${lab}"` : 'aria-hidden="true"'} focusable="false">`;
  return head + nl + out.map(s => ind + s).join(nl) + nl + '</svg>';
}
if (typeof module !== 'undefined' && module.exports) module.exports = { ROLES, roleSvg, swFor, WASH, WASHP, GROUPS, INK, PAPER, EQ, SMALL_MAX, RICH_MIN, SMALL_SHIFT };

atom({ id:'agentroles', cat:'Agent identity', name:'Agent role icons', block:'AgentMark roles (proposed)', fam:['M','T'], wide:true, tall:true,
  html:`<style>
.air-root{position:absolute;inset:0;container-type:inline-size;overflow:hidden;text-align:left}
.air-lay{height:100%;display:grid;grid-template-columns:minmax(0,1fr) 296px;gap:14px;padding:14px}
.air-main{display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0}
.air-bar{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.air-q{flex:1 1 150px;min-width:0;height:32px;border:1px solid var(--line);background:var(--card);border-radius:9px;padding:0 10px;font:inherit;font-size:13px;color:var(--ink)}
.air-q::placeholder{color:var(--faint)}
.air-sg{display:inline-flex;flex:none;background:var(--raised);border-radius:9px;padding:3px;gap:2px}
.air-sg button{border:0;background:none;border-radius:7px;padding:4px 9px;font-size:12.5px;font-weight:500;color:var(--muted);cursor:pointer}
.air-sg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:var(--shadow)}
.air-play{flex:none;border:1px solid var(--line);background:var(--card);border-radius:9px;padding:5px 11px;font-size:12.5px;font-weight:500;cursor:pointer}
.air-count{flex:none;font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums}
.air-grid{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--air-w,100px),1fr));gap:8px;align-content:start;padding:4px}
.air-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:12px 6px 10px;min-height:var(--air-h,108px);min-width:0;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);cursor:pointer;font:inherit}
.air-cell[aria-pressed=true]{border-color:var(--ink);box-shadow:0 0 0 1px var(--ink)}
.air-cell:focus-visible,.air-q:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.air-nm{font-size:12px;line-height:1.2;color:var(--muted);text-align:center}
.air-ic{display:inline-block;line-height:0}
.air-none{padding:22px 4px;font-size:13px;color:var(--muted)}
.air-side{display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0;overflow:auto;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--card)}
.air-hero{display:flex;align-items:flex-end;gap:14px;color:var(--ink)}
.air-h{margin:0;font-size:20px;line-height:1.15;font-weight:600;letter-spacing:-.02em}
.air-g{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
.air-sw{width:10px;height:10px;border-radius:3px;border:1px solid var(--line)}
.air-p{margin:0;font-size:13.5px;line-height:1.45;color:var(--muted)}
.air-lb{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin-bottom:5px}
.air-sizes{display:flex;align-items:flex-end;gap:14px;color:var(--ink)}
.air-sizes figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11px;color:var(--faint)}
.air-use{display:flex;flex-direction:column;gap:9px;font-size:13px}
.air-line{display:flex;flex-wrap:wrap;align-items:center;gap:6px 9px}
.air-chip{display:inline-flex;align-items:center;gap:7px;padding:4px 10px 4px 5px;border-radius:8px;background:var(--ink);color:var(--card);font-size:12px;font-weight:500;white-space:nowrap}
.air-chip .air-ic{color:var(--card)}
.air-by{display:inline-flex;align-items:center;gap:7px;color:var(--ink)}
.air-by b{font-weight:600}.air-by i{font-style:normal;color:var(--faint)}
.air-tag{font-size:11px;padding:1px 6px;border-radius:5px;border:1px solid var(--line);color:var(--muted)}
.air-rp{align-self:flex-start;border:1px solid var(--line);background:var(--card);border-radius:9px;padding:5px 11px;font-size:12.5px;font-weight:500;cursor:pointer}
@container (max-width:900px){.air-lay{grid-template-columns:minmax(0,1fr) 250px}}
@container (max-width:640px){
.air-lay{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;padding:12px;gap:10px}
.air-side{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;padding:12px;overflow:visible}
.air-hero{grid-row:1/4;align-self:start}.air-hero .air-prod{display:none}
.air-szw,.air-mt{display:none}
.air-h{font-size:17px}
.air-side>*{min-width:0}
.air-use{grid-column:1/-1;margin-top:4px}
.air-rp{display:none}
.air-bar .air-count{display:none}
.air-grid{grid-template-columns:repeat(auto-fill,minmax(88px,1fr))!important;gap:6px}
.air-cell{min-height:var(--air-hn,80px)!important;padding:10px 4px 8px}
.air-hero .air-svg{width:84px;height:84px}
}
</style><div class="air-root"><div class="air-lay"><div class="air-main"><div class="air-bar">
<input class="air-q" type="search" placeholder="Search roles" aria-label="Search agent roles" autocomplete="off" spellcheck="false">
<div class="air-sg" role="group" aria-label="Form"><button type="button" data-form="brand" aria-pressed="true">Brand</button><button type="button" data-form="product" aria-pressed="false">Product</button></div>
<div class="air-sg" role="group" aria-label="Size in pixels"><button type="button" data-size="16" aria-pressed="false">16</button><button type="button" data-size="24" aria-pressed="false">24</button><button type="button" data-size="32" aria-pressed="false">32</button><button type="button" data-size="64" aria-pressed="true">64</button></div>
<button type="button" class="air-play">Play all</button><span class="air-count" aria-live="polite"></span></div>
<div class="air-grid" role="group" aria-label="Agent roles"></div></div>
<aside class="air-side" aria-label="Selected role" aria-live="polite"></aside></div></div>`,
  desc:'Twenty-four agent roles drawn as one family: the square tile that means agent, a single glyph inside it and the tilted equator from the Meridian agent mark underneath. Brand form is the 64 grid with a paper tile, one pale wash and a 1.7 ink line. Product form is a square outline in currentColor with the stroke weight tuned for 16, 20, 24 and 32px; at 16px the glyph is redrawn with fewer strokes and the equator is dropped. Hover or focus a role and one part of its drawing moves for under a second: a trace, a slide, a short turn. Play all runs them in a wave across the grid.',
  api:'role(name, { brand | product, size })   play(t0) → bump = snap↑ − soft↓ (≤1.2s)   draw = retract 90ms, then trace   playAll → t0 + i·30ms',
  init(st){
    const grid = $(st,'.air-grid'), q = $(st,'.air-q'), side = $(st,'.air-side'), count = $(st,'.air-count');
    let form = 'brand', size = 64, sel = 0, cells = [], live = [], extra = [], none = null;
    const act = new Set();
    const bump = e => e <= 0 ? 0 : prog(e, 0, S.snap) - prog(e, .45, S.soft);
    const drawP = e => e <= 0 ? 1 : e < .09 ? 1 - (e/.09)**2 : prog(e, .09, S.base);
    const turnP = e => e <= 0 ? 0 : prog(e, 0, S.soft);
    const make = (r, o) => {
      const w = document.createElement('span'); w.className = 'air-ic'; w.innerHTML = roleSvg(r, { ...o, mv:true });
      const svg = w.firstChild, parts = {}, tf = {};
      svg.querySelectorAll('[data-m]').forEach(e => { parts[e.dataset.m] = e; tf[e.dataset.m] = e.getAttribute('transform') || ''; });
      return { r, wrap:w, svg, parts, tf, t0:0 };
    };
    const rest = i => { for (const id in i.parts){ const e = i.parts[id]; e.style.strokeDasharray = ''; e.style.strokeDashoffset = ''; e.style.opacity = ''; if (i.tf[id]) e.setAttribute('transform', i.tf[id]); else e.removeAttribute('transform'); } };
    const tick = (i, el) => {
      for (const m of i.r.mv){
        const e = el - (m.dl || 0);
        for (const id of m.ids){ const p = i.parts[id]; if (!p) continue;
          if (m.k === 'draw'){ const v = drawP(e); if (v >= .999){ p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.opacity = ''; } else { p.style.strokeDasharray = '1 2'; p.style.strokeDashoffset = f1(1 - v); p.style.opacity = v > .002 ? 1 : 0; } continue; }
          let a = '';
          if (m.k === 'move'){ const b = bump(e); a = `translate(${f1((m.dx || 0)*b)} ${f1((m.dy || 0)*b)})`; }
          else if (m.k === 'rot'){ a = `rotate(${f1(m.amp*bump(e))} ${m.c[0]} ${m.c[1]})`; }
          else if (m.k === 'turn'){ a = `rotate(${f1(m.amp*turnP(e))} ${m.c[0]} ${m.c[1]})`; }
          p.setAttribute('transform', `${i.tf[id]} ${a}`.trim()); }
      }
    };
    const play = (i, delay = 0) => { i.t0 = now() + delay; act.add(i); };
    const playAll = () => { let n = 0; cells.forEach((c, k) => { if (!c.hidden) play(live[k], 0.03*n++); }); extra.forEach(i => play(i)); };

    const matches = (r, s) => !s || (r.name + ' ' + r.alias.join(' ') + ' ' + GROUPS[r.grp] + ' ' + r.mean).toLowerCase().includes(s);
    const filter = () => {
      const s = q.value.trim().toLowerCase(); let n = 0; ROLES.forEach((r, k) => { const m = matches(r, s); cells[k].hidden = !m; if (m) n++; });
      count.textContent = `${n} of ${ROLES.length}`;
      if (!none){ none = document.createElement('p'); none.className = 'air-none'; grid.appendChild(none); }
      none.hidden = n > 0; none.textContent = `No role matches “${q.value.trim()}”.`; none.style.gridColumn = '1/-1';
    };
    const build = () => {
      act.clear(); grid.replaceChildren(); none = null;
      grid.style.setProperty('--air-w', (size >= 64 ? 108 : size >= 32 ? 96 : 84) + 'px'); grid.style.setProperty('--air-h', (size >= 64 ? 124 : size >= 32 ? 96 : 84) + 'px'); grid.style.setProperty('--air-hn', (size >= 64 ? 106 : size >= 32 ? 80 : 70) + 'px');
      live = []; cells = ROLES.map((r, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'air-cell'; b.setAttribute('aria-pressed', k === sel); b.tabIndex = k === sel ? 0 : -1; b.setAttribute('aria-label', `${r.name} agent. ${r.mean}`);
        const ic = make(r, { brand:form === 'brand', size }); live.push(ic); const nm = document.createElement('span'); nm.className = 'air-nm'; nm.textContent = r.name; b.append(ic.wrap, nm);
        b.addEventListener('pointerenter', () => play(ic)); b.addEventListener('focus', () => play(ic)); b.onclick = () => pick(k);
        grid.appendChild(b); return b; });
      filter();
    };
    const pick = k => {
      sel = k; cells.forEach((b, j) => { b.setAttribute('aria-pressed', j === k); b.tabIndex = j === k ? 0 : -1; }); detail(); extra.forEach(i => play(i));
    };
    const detail = () => {
      const r = ROLES[sel]; extra.forEach(i => act.delete(i)); extra = [];
      const mk = (o) => { const i = make(r, o); extra.push(i); return i.wrap; };
      side.replaceChildren();
      const hero = document.createElement('div'); hero.className = 'air-hero';
      const pr = mk({ product:1, size:64, label:`${r.name} agent, product form` }); pr.classList.add('air-prod');
      hero.append(mk({ brand:true, size:100, label:`${r.name} agent, brand form` }), pr); hero.addEventListener('pointerenter', () => extra.forEach(i => play(i)));
      const top = document.createElement('div'); const h = document.createElement('h4'); h.className = 'air-h'; h.textContent = `${r.name} agent`;
      const g = document.createElement('div'); g.className = 'air-g'; const sw = document.createElement('i'); sw.className = 'air-sw'; sw.style.background = WASH[r.grp]; g.append(sw, `${GROUPS[r.grp]} roles`); top.append(h, g);
      const mean = document.createElement('p'); mean.className = 'air-p'; mean.textContent = r.mean;
      const mt = document.createElement('p'); mt.className = 'air-p air-mt'; mt.textContent = 'Motion: ' + r.mt[0].toLowerCase() + r.mt.slice(1);
      const rp = document.createElement('button'); rp.type = 'button'; rp.className = 'air-rp'; rp.textContent = 'Replay motion'; rp.onclick = () => extra.forEach(i => play(i));
      const sizes = document.createElement('div'); const sl = document.createElement('div'); sl.className = 'air-lb'; sl.textContent = 'Product form, 16 to 32px'; const sz = document.createElement('div'); sz.className = 'air-sizes';
      [16, 20, 24, 32].forEach(s => { const f = document.createElement('figure'); f.append(mk({ product:1, size:s }), String(s)); sz.appendChild(f); }); sizes.append(sl, sz); sizes.className = 'air-szw';
      const use = document.createElement('div'); use.className = 'air-use'; const ul = document.createElement('div'); ul.className = 'air-lb'; ul.textContent = 'In use';
      const l1 = document.createElement('div'); l1.className = 'air-line'; const chip = document.createElement('span'); chip.className = 'air-chip'; chip.append(mk({ product:1, size:18 }), `${r.name} agent`); const as = document.createElement('span'); as.className = 'air-p'; as.textContent = r.act; l1.append(chip, as);
      const l2 = document.createElement('div'); l2.className = 'air-line air-by'; const pe = document.createElement('b'); pe.textContent = `${r.name} agent`; const sh = document.createElement('i'); sh.textContent = '7c41d2'; const tg = document.createElement('span'); tg.className = 'air-tag'; tg.textContent = 'Agent'; l2.append(mk({ product:1, size:20 }), pe, sh, tg);
      use.append(ul, l1, l2);
      side.append(hero, top, mean, mt, rp, sizes, use);
    };
    const nav = (from, dx, dy) => {
      const vis = cells.filter(c => !c.hidden), a = from.getBoundingClientRect(); let best = null, bd = 1e9;
      for (const c of vis){ if (c === from) continue; const b = c.getBoundingClientRect(), vx = b.left - a.left, vy = b.top - a.top;
        const ok = dx ? (dx*vx > 4 && Math.abs(vy) < a.height/2) : (dy*vy > 4);
        if (!ok) continue; const d = dx ? Math.abs(vx) + Math.abs(vy)*4 : Math.abs(vy)*4 + Math.abs(vx); if (d < bd){ bd = d; best = c; } }
      return best;
    };
    grid.addEventListener('keydown', e => {
      const d = { ArrowRight:[1, 0], ArrowLeft:[-1, 0], ArrowDown:[0, 1], ArrowUp:[0, -1] }[e.key]; if (!d) return; e.preventDefault();
      const from = document.activeElement.closest('.air-cell') || cells[sel], n = nav(from, d[0], d[1]); if (n){ cells.forEach(c => c.tabIndex = -1); n.tabIndex = 0; n.focus(); n.scrollIntoView({ block:'nearest' }); }
    });
    q.addEventListener('input', filter);
    $$(st,'[data-form]').forEach(b => b.onclick = () => { form = b.dataset.form; $$(st,'[data-form]').forEach(x => x.setAttribute('aria-pressed', x === b)); build(); });
    $$(st,'[data-size]').forEach(b => b.onclick = () => { size = +b.dataset.size; $$(st,'[data-size]').forEach(x => x.setAttribute('aria-pressed', x === b)); build(); });
    $(st,'.air-play').onclick = playAll;
    build(); detail();
    return t => { for (const i of act){ const el = t - i.t0; if (el > 1.2){ rest(i); act.delete(i); continue; } tick(i, el); } };
  }
});
})();

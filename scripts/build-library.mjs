#!/usr/bin/env node
// One offline document, assembled from the original recipes and small chrome modules.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'atoms/web');
const read=file=>fs.readFileSync(path.join(dir,file),'utf8');
const blocks=JSON.parse(read('blocks.json'));
const css=['palette','layout','recipes','panels'].map(n=>read(`library/${n}.css`)).join('\n');
const metadata=Object.fromEntries(JSON.parse(read('index.json')).map(a=>[a.id,{file:a.file}]));
const scripts=['icons','state','navigation','tiles','dialogs'].map(n=>read(`library/${n}.js`)).join('\n');
const shell=read('shell.library.before.html').replace('<!-- LIBRARY_STYLES -->',`<style>\n${css}\n</style>`);
const data=JSON.stringify(metadata).replace(/</g,'\\u003c');
const chrome=`\n;(()=>{const L={meta:${data}};\n${scripts}\n`+
 `document.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=L.icon(e.dataset.icon));\n`+read('runtime.library.page.js')+'\n})();\n';
const html=shell+read('runtime.core.js')+blocks.map(read).join('\n')+chrome+read('shell.after.html')+'\n</body></html>\n';
const out=path.resolve(process.argv[2]||path.join(root,'docs/library.html'));
if(process.argv.includes('--check'))throw new Error('Pass an output filename; compare the resulting file in version control.');
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);
console.log(`build-library: ${blocks.length} recipe source files → ${path.relative(root,out)}`);

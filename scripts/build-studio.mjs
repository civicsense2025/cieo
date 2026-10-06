#!/usr/bin/env node
/** Rebuild the explorer studio page from real recipes. Default output is docs/studio.html. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=path.join(root,'atoms/web');
const read=relative=>fs.readFileSync(path.join(base,relative),'utf8');
const blocks=JSON.parse(read('blocks.json'));
if(!Array.isArray(blocks)||blocks.some(p=>!/^blocks\/[\w-]+\.js$/.test(p)))throw Error('Invalid blocks manifest');
const styles=['palette','layout','previews','polish','panels','responsive'].map(n=>`library/${n}.css`);
const scripts=['runtime.core.js',...blocks,...['icons','model','navigation','previews','panels','preferences'].map(n=>`library/${n}.js`),'library/orchestrate.js'];
const sources=Object.fromEntries(JSON.parse(read('index.json')).map(({id,file})=>[id,file]));
const standalone=process.argv.includes('--standalone');
const check=process.argv.includes('--check');
const argument=process.argv.slice(2).find(p=>!p.startsWith('--'));
const output=argument?path.resolve(argument):path.join(root,standalone?'preview/Cieo-studio.html':'docs/studio.html');
const escapeScript=s=>s.replace(/<\/script/gi,'<\\/script');
const styleMarkup=standalone?styles.map(p=>`<style>\n${read(p)}\n</style>`).join('\n'):styles.map(p=>`<link rel="stylesheet" href="../atoms/web/${p}">`).join('\n');
const sourceMap=`<script>window.CieoSources=${JSON.stringify(sources).replace(/</g,'\\u003c')};</script>`;
const scriptMarkup=sourceMap+'\n'+scripts.map(p=>standalone?`<script>\n${escapeScript(read(p))}\n</script>`:`<script defer src="../atoms/web/${p}"></script>`).join('\n');
const html=read('library/shell.html').replace('<!-- CIEO_LIBRARY_STYLES -->',styleMarkup).replace('<!-- CIEO_LIBRARY_SCRIPTS -->',scriptMarkup);
if(check){if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==html)throw Error(`Stale library output: ${path.relative(root,output)}`);}
else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,html);}
console.log(`library: ${blocks.length} source blocks, ${Object.keys(sources).length} source links; ${standalone?'standalone':'modular'} ${check?'verified':'written'}`);

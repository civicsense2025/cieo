#!/usr/bin/env node
/** Builds the existing catalogue from every checked-in atom, not a separate specimen set. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'atoms/web');
const read=p=>fs.readFileSync(path.join(source,p),'utf8');
const blocks=JSON.parse(read('blocks.json'));
const styles=['tokens','shell','controls','recipes','responsive','accessibility'];
const scripts=['icons','model','motion','cards','navigation','dialogs','settings','app'];
for(const file of blocks)if(!/^blocks\/[\w.-]+\.js$/.test(file))throw new Error(`Invalid recipe path: ${file}`);
const shell=read('workbench/shell.html');
const args=process.argv.slice(2);
const external=args.includes('--source');
const target=args.find(arg=>!arg.startsWith('--')) || 'docs/workbench.html';
const output=path.resolve(root,target);
const scriptSafe=value=>value.replace(/<\/script/gi,'<\\/script');
const css=styles.map(name=>read(`library/styles/${name}.css`)).join('\n');
let html;
if(external){
  const links=styles.map(name=>`<link rel="stylesheet" href="../atoms/web/library/styles/${name}.css">`).join('\n');
  const setup=`<script>window.CieoLibrarySources=${JSON.stringify(blocks)};</script>\n<script src="../atoms/web/library/loader.js" defer></script>`;
  html=shell.replace('<!-- CIEO_STYLES -->',()=>links).replace('<!-- CIEO_SCRIPTS -->',()=>setup);
}else{
  const recipeCode=blocks.map(file=>`\nglobalThis.__cieoRecipeFile=${JSON.stringify(file)};\n${read(file)}`).join('\n');
  const code=read('runtime.core.js')+'\n'+recipeCode+'\ndelete globalThis.__cieoRecipeFile;\n'+scripts.map(name=>read(`library/ui/${name}.js`)).join('\n')+'\n'+read('workbench/runtime.js');
  html=shell.replace('<!-- CIEO_STYLES -->',()=>`<style>\n${css}\n</style>`).replace('<!-- CIEO_SCRIPTS -->',()=>`<script>\n${scriptSafe(code)}\n</script>`);
}
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,html);
console.log(`library: ${blocks.length} recipe files → ${path.relative(root,output)} (${external?'source-linked':'standalone'})`);

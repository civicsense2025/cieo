import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFileSync(join(root,path),'utf8');
test('catalogue generation retains the original runtime and every ordered recipe',()=>{
 const dir=mkdtempSync(join(tmpdir(),'cieo catalogue '));
 try {
  const out=join(dir,'library.html');
  execFileSync(process.execPath,['scripts/build-library.mjs',out],{cwd:root});
  const html=readFileSync(out,'utf8'),runtime=read('atoms/web/runtime.core.js');
  assert.ok(html.includes(runtime));
  let previous=html.indexOf(runtime)+runtime.length;
  for(const file of JSON.parse(read('atoms/web/blocks.json'))){
   const content=read('atoms/web/'+file),position=html.indexOf(content,previous);
   assert.ok(position>=previous,`Recipe missing or out of order: ${file}`);
   previous=position+content.length;
  }
  assert.equal(html,read('docs/library.html'),'Regenerate the checked-in library after editing.');
 } finally {rmSync(dir,{recursive:true,force:true})}
});
test('new chrome consumes the original spring and mounts expensive markup on demand',()=>{
 const dialogs=read('atoms/web/library/dialogs.js'),tiles=read('atoms/web/library/tiles.js');
 assert.match(dialogs,/new Track\(12,S\.base\)/);
 assert.doesNotMatch(dialogs,/Math\.exp/);
 assert.match(tiles,/L\.mountAtom=a=>/);
 assert.match(tiles,/stage\.innerHTML=a\.html/);
 assert.match(tiles,/IntersectionObserver/);
 assert.doesNotMatch(read('atoms/web/runtime.library.page.js'),/Math\.exp/);
});

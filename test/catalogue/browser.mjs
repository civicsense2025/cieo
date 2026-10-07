/** Real-registry smoke test. No fake components or replacement motion runtime. */
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {recipes} from './registry.mjs';
const root=process.cwd(),out=path.join(root,'catalogue-artifacts');fs.mkdirSync(out,{recursive:true});
execFileSync(process.execPath,['scripts/build-collection.mjs'],{cwd:root,stdio:'inherit'});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light'});
const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const check=async(name,fn)=>{try{await fn();checks.push({name,pass:true});console.log('PASS',name);}catch(e){checks.push({name,pass:false,error:String(e)});console.error('FAIL',name,String(e));}};
const delay=()=>page.waitForTimeout(450);
const url=pathToFileURL(path.join(root,'docs/collection.html')).href;
const shot=async(name)=>page.screenshot({path:path.join(out,name+'.png')});
try{
 await page.goto(url);await page.waitForFunction(()=>!!window.CIEO_REVIEW,null,{timeout:30000});await delay();
 await check('every declared atom is registered once',async()=>{assert.equal(new Set(recipes.map(a=>a.id)).size,recipes.length);assert.deepEqual(await page.evaluate(()=>CIEO_REVIEW.ids),recipes.map(a=>a.id));assert.equal(await page.locator('article.tile').count(),recipes.length);});
 await check('every atom links to its actual recipe file',async()=>assert.deepEqual(await page.evaluate(()=>A.map(({id,file})=>({id,file}))),recipes));
 await shot('catalogue-desktop');
 await check('tabs support keyboard and real panel state',async()=>{
  await page.locator('#tabs [role=tab]').first().focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#tabs [role=tab]').nth(1).getAttribute('aria-selected'),'true');await delay();
  assert.equal(await page.locator('#tabs-panel-1').getAttribute('aria-hidden'),'false');
 });
 await check('accordion exposes expansion and controls',async()=>{
  await page.locator('#accordion .acc-button').first().click();await delay();
  assert.equal(await page.locator('#accordion .acc-button').first().getAttribute('aria-expanded'),'true');
  assert.ok(await page.locator('#acc-answer-0').evaluate(el=>el.getBoundingClientRect().height)>20);
 });
 await check('switch uses native Space and preserves the original instance in Details',async()=>{
  await page.locator('#switch .tg').focus();await page.keyboard.press('Space');await delay();
  assert.equal(await page.locator('#switch .tg').getAttribute('aria-checked'),'true');
  await page.evaluate(()=>{window.testSwitch=document.querySelector('#switch .tg');});
  await page.locator('#switch [data-inspect]').last().click();await delay();
  assert.equal(await page.evaluate(()=>window.testSwitch===document.querySelector('#inspect-preview .tg')),true);
  await shot('catalogue-detail');await page.locator('#inspect-dialog [data-close]').click();await delay();
  assert.equal(await page.locator('#switch .tg').getAttribute('aria-checked'),'true');
 });
 await check('saving changes the real Saved collection',async()=>{
  await page.locator('#switch [data-save]').click();
  await page.evaluate(()=>location.hash='saved');await delay();
  assert.equal(await page.locator('#groups > .tile:not([hidden])').count(),1);
  assert.equal(await page.locator('#groups > .tile:not([hidden])').getAttribute('id'),'switch');
  await page.evaluate(()=>location.hash='all');await delay();
 });
 await check('dropdown supports keyboard selection and closes with Escape',async()=>{
  await page.locator('#dropdown .dd').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('End');await page.keyboard.press('Enter');await delay();
  assert.equal(await page.locator('#dropdown [role=menuitemradio]').last().getAttribute('aria-checked'),'true');
  await page.locator('#dropdown .dd').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.equal(await page.locator('#dropdown .dd').getAttribute('aria-expanded'),'false');
 });
 await check('search selects real components and empty state recovers',async()=>{
  await page.locator('#atom-search').fill('Accordion');await delay();assert.ok(await page.locator('#groups > .tile:not([hidden])').count()>0);
  await page.locator('#atom-search').fill('no-such-component-zzq');await delay();assert.equal(await page.locator('#empty-state').isVisible(),true);
  await page.locator('#empty-state button').click();await delay();assert.equal(await page.locator('#groups > .tile:not([hidden])').count(),recipes.length);
 });
 await check('existing writing category links still work',async()=>{await page.goto(url+'#cat-writing');await delay();assert.equal(await page.locator('#collection-title').textContent(),'Writing');assert.ok(await page.locator('#groups > .tile:not([hidden])').count()>=40);});
 await check('all registered recipes initialize and render without host errors',async()=>{
  await page.evaluate(()=>CIEO_REVIEW.initAll());
  const failures=await page.evaluate(()=>{const failures=CIEO_REVIEW.errors().map(id=>({id,phase:'init'}));for(const a of A){if(!a.inited)failures.push({id:a.id,phase:'not initialized'});if(a.render)for(const dt of [0,.1,1]){try{a.render(clock.t+dt);}catch(e){failures.push({id:a.id,phase:'render',message:String(e)});}}}return failures;});fs.writeFileSync(path.join(out,'recipe-errors.json'),JSON.stringify(failures,null,2));assert.deepEqual(failures,[]);
 });
 await page.evaluate(()=>location.hash='all');await delay();
 await check('Trip polls totals can be hidden and restored',async()=>{
  await page.locator('#atom-search').fill('Trip polls');await delay();
  const totals=page.locator('#trippoll .tt');
  assert.equal(await totals.count(),3);assert.equal(await totals.first().isVisible(),true);
  await page.locator('#trippoll .pg-tg').click();
  assert.equal(await page.locator('#trippoll .pg-tg').getAttribute('aria-pressed'),'false');
  assert.deepEqual(await totals.evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).display)),['none','none','none']);
  await page.locator('#trippoll .pg-tg').click();
  assert.equal(await page.locator('#trippoll .pg-tg').getAttribute('aria-pressed'),'true');
  assert.equal(await totals.first().isVisible(),true);
  await page.locator('#atom-search').fill('');await delay();
 });
 await check('dark appearance changes the actual recipe variables',async()=>{
  await page.locator('.ui-topbar [data-open=appearance-dialog]').click();await page.getByRole('button',{name:'Dark',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.appearance),'dark');
  await page.getByRole('button',{name:'Coral accent',exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.accent),'coral');
  await page.getByRole('button',{name:'Close appearance',exact:true}).click();await delay();await shot('catalogue-dark');
 });
 await check('view controls persist after reload',async()=>{await page.reload();await page.waitForFunction(()=>!!window.CIEO_REVIEW);assert.equal(await page.evaluate(()=>CieoCatalogue.appearance.settings.appearance),'dark');});
 await page.locator('.ui-topbar [data-open=appearance-dialog]').click();await page.getByRole('button',{name:'Light',exact:true}).click();await page.getByRole('button',{name:'Iris accent',exact:true}).click();await page.getByRole('button',{name:'Close appearance',exact:true}).click();
 for(const width of [360,390,600,768,1024,1440,1920]){
  await check(`no page overflow at ${width}px`,async()=>{await page.setViewportSize({width,height:width<600?844:1000});await delay();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));});
  if(width===390)await shot('catalogue-phone');if(width===768)await shot('catalogue-tablet');
 }
 await check('phone navigation opens and selects the full collection',async()=>{
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Browse collections',exact:true}).click();await delay();await shot('catalogue-phone-navigation');
  await page.locator('#mobile-nav a[href="#all"]').click();await delay();assert.equal(await page.locator('#browse-dialog').isVisible(),false);assert.equal(await page.locator('.ui-sidebar').isVisible(),false);assert.equal(await page.locator('#collection-title').textContent(),'Everything, in motion.');
 });
 await check('OS reduced motion pauses previews without removing controls',async()=>{await page.emulateMedia({reducedMotion:'reduce'});await delay();assert.equal(await page.evaluate(()=>CieoCatalogue.reduced),true);assert.equal(await page.locator('#pause-motion').getAttribute('aria-label'),'Reduced motion is enabled');});
 await check('forced colors preserve visible navigation',async()=>{await page.emulateMedia({forcedColors:'active'});assert.equal(await page.locator('#atom-search').isVisible(),true);});
 await check('no uncaught browser errors',async()=>assert.deepEqual(errors,[]));
}catch(e){checks.push({name:'harness',pass:false,error:String(e)});console.error(e);}
finally{
 fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify({checks,errors,engine:'Chromium',viewports:[360,390,600,768,1024,1440,1920]},null,2));
 await browser.close();
}
if(checks.some(x=>!x.pass))process.exitCode=1;

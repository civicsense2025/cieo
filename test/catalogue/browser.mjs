/** Real-registry smoke test. No fake components or replacement motion runtime. */
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=path.join(root,'catalogue-artifacts');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light'});
const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const check=async(name,fn)=>{try{await fn();checks.push({name,pass:true});console.log('PASS',name);}catch(e){checks.push({name,pass:false,error:String(e)});console.error('FAIL',name,String(e));}};
const delay=()=>page.waitForTimeout(450);
const url=pathToFileURL(path.join(root,'docs/library.html')).href;
const shot=async(name)=>page.screenshot({path:path.join(out,name+'.png')});
try{
 await page.goto(url);await page.waitForFunction(()=>!!window.CieoCatalogue,null,{timeout:30000});await delay();
 await check('all 345 existing atoms are registered once',async()=>{assert.equal(await page.evaluate(()=>CieoCatalogue.atoms.length),345);assert.equal(await page.locator('article.tile').count(),345);});
 await check('every atom links to its actual recipe file',async()=>assert.equal(await page.evaluate(()=>CieoCatalogue.atoms.filter(a=>!/^blocks\/[\w.-]+\.js$/.test(a.sourceFile)).length),0));
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
  await page.getByRole('button',{name:'Open Switch details',exact:true}).click();await delay();
  assert.equal(await page.evaluate(()=>window.testSwitch===document.querySelector('#component-preview #switch .tg')),true);
  await shot('catalogue-detail');await page.getByRole('button',{name:'Close component',exact:true}).click();await delay();
  assert.equal(await page.locator('#switch .tg').getAttribute('aria-checked'),'true');
 });
 await check('saving changes the real Saved collection',async()=>{
  await page.getByRole('button',{name:'Save Switch',exact:true}).click();
  await page.evaluate(()=>CieoCatalogue.select('saved'));await delay();
  assert.equal(await page.locator('#library-grid > .tile:not([hidden])').count(),1);
  assert.equal(await page.locator('#library-grid > .tile:not([hidden])').getAttribute('id'),'switch');
  await page.evaluate(()=>CieoCatalogue.select('featured'));await delay();
 });
 await check('dropdown supports keyboard selection and closes with Escape',async()=>{
  await page.locator('#dropdown .dd').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('End');await page.keyboard.press('Enter');await delay();
  assert.equal(await page.locator('#dropdown .dd-item').last().getAttribute('aria-checked'),'true');
  await page.locator('#dropdown .dd').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#dropdown .dd').getAttribute('aria-expanded'),'false');
 });
 await check('search selects real components and empty state recovers',async()=>{
  await page.locator('#library-search').fill('Accordion');await delay();assert.ok(await page.locator('#library-grid > .tile:not([hidden])').count()>0);
  await page.locator('#library-search').fill('no-such-component-zzq');await delay();assert.equal(await page.locator('#library-empty').isVisible(),true);
  await page.locator('#library-empty button').click();await delay();assert.equal(await page.locator('#library-grid > .tile:not([hidden])').count(),345);
 });
 await check('existing writing category links still work',async()=>{await page.goto(url+'#cat-writing');await delay();assert.equal(await page.locator('#library-title').textContent(),'Writing');assert.ok(await page.locator('#library-grid > .tile:not([hidden])').count()>=40);});
 await check('all registered recipes initialize and render without host errors',async()=>{
  await page.evaluate(()=>{CieoCatalogue.select('all');for(const a of CieoCatalogue.atoms){CieoCatalogue.ensure(a);if(a.render){try{a.render(clock.t+1);}catch(e){CieoCatalogue.errors.push({id:a.id,phase:'audit',message:String(e)});}}}});
  await delay();const failures=await page.evaluate(()=>CieoCatalogue.errors);fs.writeFileSync(path.join(out,'recipe-errors.json'),JSON.stringify(failures,null,2));assert.deepEqual(failures,[]);
 });
 await page.evaluate(()=>CieoCatalogue.select('featured'));await delay();
 await check('dark appearance changes the actual recipe variables',async()=>{
  await page.locator('[data-lib-action=settings]').click();await page.getByRole('button',{name:'Dark',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
  await page.getByRole('button',{name:'Mint accent',exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.accent),'mint');
  await page.getByRole('button',{name:'Close view settings',exact:true}).click();await delay();await shot('catalogue-dark');
 });
 await check('view controls persist after reload',async()=>{await page.reload();await page.waitForFunction(()=>!!window.CieoCatalogue);assert.equal(await page.evaluate(()=>CieoCatalogue.state.theme),'dark');});
 await page.locator('[data-lib-action=settings]').click();await page.getByRole('button',{name:'Light',exact:true}).click();await page.getByRole('button',{name:'Iris accent',exact:true}).click();await page.getByRole('button',{name:'Close view settings',exact:true}).click();
 for(const width of [360,390,600,768,1024,1440,1920]){
  await check(`no page overflow at ${width}px`,async()=>{await page.setViewportSize({width,height:width<600?844:1000});await delay();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));});
  if(width===390)await shot('catalogue-phone');if(width===768)await shot('catalogue-tablet');
 }
 await check('phone navigation returns the same sidebar and stays reachable',async()=>{
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open library navigation',exact:true}).click();await delay();await shot('catalogue-phone-navigation');
  await page.locator('#mobile-navigation .lib-nav-button').filter({hasText:'Everything'}).first().click();await delay();assert.equal(await page.locator('#navigation-dialog').isVisible(),false);assert.equal(await page.locator('.lib-shell > #library-sidebar').count(),1);
 });
 await check('OS reduced motion pauses previews without removing controls',async()=>{await page.emulateMedia({reducedMotion:'reduce'});await delay();assert.equal(await page.evaluate(()=>CieoCatalogue.state.paused),true);assert.equal(await page.locator('#playback-button').getAttribute('aria-label'),'Play live previews');});
 await check('forced colors preserve visible navigation',async()=>{await page.emulateMedia({forcedColors:'active'});assert.equal(await page.locator('#library-search').isVisible(),true);});
 await check('no uncaught browser errors',async()=>assert.deepEqual(errors,[]));
}catch(e){checks.push({name:'harness',pass:false,error:String(e)});console.error(e);}
finally{
 fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify({checks,errors,engine:'Chromium',viewports:[360,390,600,768,1024,1440,1920]},null,2));
 await browser.close();
}
if(checks.some(x=>!x.pass))process.exitCode=1;

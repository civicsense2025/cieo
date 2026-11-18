import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const context=vm.createContext({window:{},URLSearchParams});
vm.runInContext(fs.readFileSync(new URL('../../atoms/web/library/ui/model.js',import.meta.url),'utf8'),context);
const L=context.window.CieoLibrary;
const atoms=[{id:'tabs',name:'Tabs with panel',cat:'Content',block:'tabs',desc:'Measured panels',fam:['M','S','E']},{id:'writing',name:'Édition',cat:'Writing',block:'editor',desc:'Write a page',fam:['S']}];
const plain=x=>JSON.parse(JSON.stringify(x));
test('legacy category and component links retain their destinations',()=>{
 assert.deepEqual(plain(L.route('#cat-writing',atoms)),{view:'category',category:'Writing'});
 assert.deepEqual(plain(L.route('#tabs',atoms)),{atom:'tabs'});
 assert.deepEqual(plain(L.route('#atom=tabs&theme=black&cols=2',atoms)),{atom:'tabs',theme:'dark',columns:2});
});
test('unknown routes and presentation values cannot become executable input',()=>{
 assert.deepEqual(plain(L.route('#atom=nope&theme=purple&cols=200&family=oops',atoms)),{});
 const s=L.validSettings({theme:'bogus',speed:Infinity,columns:300,backdrops:'false',injected:'x'});
 assert.equal(s.theme,'system');assert.equal(s.speed,1);assert.equal(s.columns,3);assert.equal(s.backdrops,true);assert.equal(s.injected,undefined);
});
test('search is accent-insensitive and combines words with the motion filter',()=>{
 assert.equal(L.matches(atoms[1],{...L.defaults,query:'edition page',family:'S'},new Set()),true);
 assert.equal(L.matches(atoms[1],{...L.defaults,query:'edition page',family:'M'},new Set()),false);
});
test('saved and named collections filter the actual registry',()=>{
 assert.equal(L.matches(atoms[0],{...L.defaults,view:'saved'},new Set(['tabs'])),true);
 assert.equal(L.matches(atoms[1],{...L.defaults,view:'saved'},new Set(['tabs'])),false);
 assert.equal(L.matches(atoms[1],{...L.defaults,view:'collection',category:'writing'},new Set()),true);
});
test('blocked storage is a supported session-only fallback',()=>{
 assert.equal(L.safeRead('x'),null);assert.equal(L.safeWrite('x',{a:1}),false);
});
test('search and URL inputs are bounded',()=>{
 assert.equal(L.route('#q='+('a'.repeat(500)),atoms).query.length,240);
 assert.equal(L.route('#q=hello',atoms).view,'all');
});

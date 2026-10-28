import test from 'node:test';
import assert from 'node:assert/strict';
import { popoverPosition } from '../dist/primitives/Popover/position.js';
const viewport = { left: 0, top: 0, width: 390, height: 640 };
const panel = { width: 240, height: 260 };
test('bottom-edge menu flips above and stays inside the viewport', () => {
  const p = popoverPosition({left:330,top:590,width:44,height:40},panel,viewport);
  assert.equal(p.side,'top'); assert.equal(p.x,138); assert.equal(p.y,322);
});
test('RTL start follows the trigger’s inline start', () => {
  const a={left:100,top:30,width:44,height:40};
  assert.equal(popoverPosition(a,{width:100,height:100},viewport,{rtl:true}).x,44);
  assert.equal(popoverPosition(a,{width:100,height:100},viewport,{rtl:false}).x,100);
});
test('oversized content is bounded and visual viewport offsets are respected', () => {
  const v={left:20,top:50,width:320,height:400};
  const p=popoverPosition({left:50,top:100,width:40,height:40},{width:900,height:1000},v);
  assert.equal(p.maxWidth,296);assert.equal(p.maxHeight,376);
  assert.equal(p.x,32);assert.equal(p.y,62);
});
test('side menus flip horizontally and center alignment is stable', () => {
  const p=popoverPosition({left:330,top:200,width:44,height:40},panel,viewport,{side:'right',align:'center'});
  assert.equal(p.side,'left');assert.equal(p.x,82);assert.equal(p.y,90);
});

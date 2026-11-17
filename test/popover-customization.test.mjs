import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Popover } from '../dist/primitives/Popover/Popover.js';

test('popover exposes named content and styling slots without replacing its semantics', () => {
  const html = renderToStaticMarkup(h(Popover, {
    open: true, label: 'Image tools', trigger: h('button', null, 'Tools'),
    className: 'host-menu', slotProps: { content: { className: 'host-menu-content', style: { padding: 24 }, 'data-testid': 'tools-panel' } },
    slots: { header: h('h2', null, 'Choose a tool'), footer: h('a', {href:'/help'}, 'Help') },
  }, h('a', {href:'/resize'}, 'Resize')));
  assert.match(html, /host-menu/);
  assert.match(html, /host-menu-content/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-label="Image tools"/);
  assert.match(html, /Choose a tool/);
  assert.match(html, /href="\/help"/);
});

test('tabs expose presentation slots while keeping selection and panel relationships', async () => {
  const { TabList } = await import('../dist/primitives/TabList/TabList.js');
  const { Tab } = await import('../dist/primitives/Tab/Tab.js');
  const html = renderToStaticMarkup(h(TabList, {label:'Settings',value:'trace',slotProps:{root:{className:'host-tabs'},indicator:{className:'host-marker'}}},
    h(Tab,{value:'trace',id:'trace-tab',controls:'trace-panel',slotProps:{root:{className:'host-tab'}}},'Trace')));
  assert.match(html,/host-tabs/);assert.match(html,/host-tab/);assert.match(html,/host-marker/);
  assert.match(html,/aria-selected="true"/);assert.match(html,/aria-controls="trace-panel"/);assert.match(html,/id="trace-tab"/);
});

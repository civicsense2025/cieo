import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Popover } from '../dist/primitives/Popover/Popover.js';

test('popover exposes named content and styling slots without replacing its semantics', () => {
  const html = renderToStaticMarkup(h(Popover, {
    open: true, label: 'Image tools', trigger: h('button', null, 'Tools'),
    className: 'forma-menu', slotProps: { content: { className: 'forma-menu-content', style: { padding: 24 }, 'data-testid': 'tools-panel' } },
    slots: { header: h('h2', null, 'Choose a tool'), footer: h('a', {href:'/help'}, 'Help') },
  }, h('a', {href:'/resize'}, 'Resize')));
  assert.match(html, /forma-menu/);
  assert.match(html, /forma-menu-content/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-label="Image tools"/);
  assert.match(html, /Choose a tool/);
  assert.match(html, /href="\/help"/);
});

test('tabs expose presentation slots while keeping selection and panel relationships', async () => {
  const { TabList } = await import('../dist/primitives/TabList/TabList.js');
  const { Tab } = await import('../dist/primitives/Tab/Tab.js');
  const html = renderToStaticMarkup(h(TabList, {label:'Settings',value:'trace',slotProps:{root:{className:'forma-tabs'},indicator:{className:'forma-marker'}}},
    h(Tab,{value:'trace',id:'trace-tab',controls:'trace-panel',slotProps:{root:{className:'forma-tab'}}},'Trace')));
  assert.match(html,/forma-tabs/);assert.match(html,/forma-tab/);assert.match(html,/forma-marker/);
  assert.match(html,/aria-selected="true"/);assert.match(html,/aria-controls="trace-panel"/);assert.match(html,/id="trace-tab"/);
});

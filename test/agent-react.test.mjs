import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { createAgentStore, selectPendingApprovals } from '../dist/agent/index.js';
import { useAgentStore, useAgentStream } from '../dist/agent/react.js';

test('useAgentStore renders the current snapshot on the server', () => {
  const store = createAgentStore();
  store.apply([{ v: 1, seq: 1, at: 't', runId: 'r', agentId: 'a', parentAgentId: null, type: 'approval.requested', data: { approvalId: 'ap', title: 'Publish' } }]);
  function Pending() {
    const pending = useAgentStore(store, selectPendingApprovals);
    return h('p', null, `${pending.length} waiting: ${pending[0].title}`);
  }
  assert.equal(renderToString(h(Pending)), '<p>1 waiting: Publish</p>');
});

test('useAgentStream opens nothing during a server render', () => {
  let opened = 0;
  class Source { constructor() { opened += 1; } close() {} }
  function Follow() {
    return h('span', null, useAgentStream(createAgentStore(), { url: 'http://host/e', EventSource: Source }));
  }
  assert.equal(renderToString(h(Follow)), '<span>closed</span>');
  assert.equal(opened, 0);
});

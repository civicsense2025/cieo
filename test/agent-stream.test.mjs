import test from 'node:test';
import assert from 'node:assert/strict';
import { connectEventStream, createAgentStore } from '../dist/agent/index.js';

const ev = (seq, type = 'run.status', data = { status: 'running' }) => ({ v: 1, seq, at: 't', runId: 'r', agentId: 'a', parentAgentId: null, type, data });

function harness() {
  const sources = [];
  class FakeSource {
    constructor(url, init) { this.url = url; this.init = init; this.closed = false; sources.push(this); }
    close() { this.closed = true; }
    emit(frame) { this.onmessage?.({ data: typeof frame === 'string' ? frame : JSON.stringify(frame) }); }
  }
  const pending = [];
  const timers = { set: (fn, ms) => { const h = { fn, ms }; pending.push(h); return h; }, clear: (h) => { const i = pending.indexOf(h); if (i >= 0) pending.splice(i, 1); } };
  const flush = () => pending.splice(0).forEach((h) => h.fn());
  return { sources, pending, timers, flush, FakeSource };
}

test('resumes from the store cursor, applies frames, and survives garbage frames', () => {
  const h = harness();
  const store = createAgentStore();
  const statuses = [];
  const close = connectEventStream({ url: 'http://host/events', store, EventSource: h.FakeSource, timers: h.timers, onStatus: (s) => statuses.push(s) });
  assert.equal(new URL(h.sources[0].url).searchParams.get('after'), '0');
  h.sources[0].onopen();
  h.sources[0].emit(ev(1));
  h.sources[0].emit('{not json');
  h.sources[0].emit([ev(2), ev(3)]);
  assert.equal(store.getSnapshot().cursor, 3);
  h.sources[0].onerror();
  assert.equal(h.sources[0].closed, true);
  h.flush();
  assert.equal(new URL(h.sources[1].url).searchParams.get('after'), '3', 'reconnect resumes after the last applied event');
  close();
  assert.deepEqual(statuses, ['connecting', 'open', 'retrying', 'connecting', 'closed']);
});

test('a hole in the log reconnects from the last applied event', () => {
  const h = harness();
  const store = createAgentStore();
  connectEventStream({ url: 'http://host/events', store, EventSource: h.FakeSource, timers: h.timers, random: () => 1 });
  h.sources[0].emit(ev(1));
  h.sources[0].emit(ev(5));
  assert.equal(h.sources[0].closed, true);
  h.flush();
  assert.equal(new URL(h.sources[1].url).searchParams.get('after'), '1');
});

test('backoff doubles up to the cap and resets after a successful open', () => {
  const h = harness();
  connectEventStream({ url: 'http://host/e', store: createAgentStore(), EventSource: h.FakeSource, timers: h.timers, random: () => 1, retry: { initialMs: 100, maxMs: 350 } });
  const delays = [];
  for (let i = 0; i < 4; i++) { h.sources.at(-1).onerror(); delays.push(h.pending[0].ms); h.flush(); }
  assert.deepEqual(delays, [100, 200, 350, 350]);
  h.sources.at(-1).onopen();
  h.sources.at(-1).onerror();
  assert.equal(h.pending[0].ms, 100);
});

test('abort closes the source, cancels a pending retry, and never reconnects', () => {
  const h = harness();
  const controller = new AbortController();
  connectEventStream({ url: 'http://host/e', store: createAgentStore(), EventSource: h.FakeSource, timers: h.timers, signal: controller.signal });
  h.sources[0].onerror();
  assert.equal(h.pending.length, 1);
  controller.abort();
  assert.equal(h.pending.length, 0);
  h.flush();
  assert.equal(h.sources.length, 1);
  const already = new AbortController(); already.abort();
  connectEventStream({ url: 'http://host/e', store: createAgentStore(), EventSource: h.FakeSource, timers: h.timers, signal: already.signal });
  assert.equal(h.sources.length, 1, 'an aborted signal opens nothing');
});

test('a host map turns its own frames into agent events', () => {
  const h = harness();
  const store = createAgentStore();
  connectEventStream({ url: 'http://host/e', store, EventSource: h.FakeSource, timers: h.timers, cursorParam: 'cursor', withCredentials: true, map: (f) => (f.skip ? null : ev(f.n)) });
  assert.ok(new URL(h.sources[0].url).searchParams.has('cursor'));
  assert.deepEqual(h.sources[0].init, { withCredentials: true });
  h.sources[0].emit({ skip: true });
  h.sources[0].emit({ n: 1 });
  assert.equal(store.getSnapshot().cursor, 1);
});

test('missing EventSource and bad retry settings fail loudly', () => {
  assert.throws(() => connectEventStream({ url: 'http://h', store: createAgentStore(), EventSource: undefined }), TypeError);
  assert.throws(() => connectEventStream({ url: 'http://h', store: createAgentStore(), EventSource: class {}, retry: { initialMs: 0 } }), RangeError);
});

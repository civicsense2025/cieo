// test/primitives-comments.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ByLine } from '../dist/primitives/ByLine/ByLine.js';
import { safeHref } from '../dist/primitives/Mention/Mention.js';
import { ReplyPreview, replyDismissLabel } from '../dist/primitives/ReplyPreview/ReplyPreview.js';
import { CharacterCountRing, ringState, ringAnnouncement } from '../dist/primitives/CharacterCountRing/CharacterCountRing.js';
import { Comment, commentDepth, commentHasRail } from '../dist/primitives/Comment/Comment.js';
import { CommentThread, buildCommentTree, countDescendants, visibleReplies, flattenReplies, moreRepliesLabel } from '../dist/primitives/CommentThread/CommentThread.js';
import { CommentComposer, composerCanSubmit, composerKeyAction, composerLength, composerShowsCount } from '../dist/primitives/CommentComposer/CommentComposer.js';

const html = (el) => renderToStaticMarkup(el);

test('safeHref only lets http(s) and relative links through', () => {
  for (const ok of ['https://a.test/x', 'http://a.test', '/u/ava', './a', '../a', '#top', '?q=1']) assert.equal(safeHref(ok), ok);
  for (const bad of ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'data:text/html,hi', 'vbscript:x', 'mailto:a@b.c', 'https://user:pass@a.test/reset', '//evil.test', '', undefined, null, '/\\evil.test', '\\\\evil.test', 'u/ava']) assert.equal(safeHref(bad), null, String(bad));
});

test('ByLine: author, badge, crumb and time in order; time sits in a time element; unsafe links are plain text', () => {
  const out = html(h(ByLine, { author: 'ginandtanic', href: '/u/g', badge: h('b', null, 'v'), context: 'midterms 2026', contextHref: 'javascript:x', time: '1d', dateTime: '2026-10-22T10:00:00Z' }));
  assert.match(out, /<a class="cieo-by-line-author" href="\/u\/g">ginandtanic<\/a>/);
  assert.ok(out.indexOf('ginandtanic') < out.indexOf('<b>v</b>') && out.indexOf('<b>v</b>') < out.indexOf('›') && out.indexOf('›') < out.indexOf('midterms 2026') && out.indexOf('midterms 2026') < out.indexOf('<time'));
  assert.match(out, /<time class="cieo-by-line-time" dateTime="2026-10-22T10:00:00Z">1d<\/time>/);
  assert.match(out, /<span class="cieo-by-line-context">midterms 2026<\/span>/);
  assert.doesNotMatch(out, /javascript:/);
  assert.match(out, /aria-hidden="true">›</);
});

test('ByLine: no context and no time means no separators; unsafe author href renders text', () => {
  const out = html(h(ByLine, { author: 'Ava', href: 'javascript:x' }));
  assert.doesNotMatch(out, /›|·|<time|<a /);
  assert.match(html(h(ByLine, { author: 'Ava', handle: 'ava' })), />@ava</);
});

test('ReplyPreview composer variant has a named dismiss button; quote jumps only with onJump', () => {
  const c = html(h(ReplyPreview, { author: 'Ava', excerpt: 'Hello there', variant: 'composer', onDismiss: () => {} }));
  assert.match(c, /data-variant="composer"/);
  assert.match(c, /<button[^>]*aria-label="Cancel reply to Ava"/);
  assert.equal(replyDismissLabel('Ava'), 'Cancel reply to Ava');
  assert.doesNotMatch(html(h(ReplyPreview, { author: 'Ava', excerpt: 'x', variant: 'composer' })), /<button/);
  const q = html(h(ReplyPreview, { author: 'Ava', excerpt: 'Hello', onJump: () => {} }));
  assert.match(q, /^<button[^>]*data-variant="quote"/);
  assert.match(q, /Hello/);
  assert.doesNotMatch(html(h(ReplyPreview, { author: 'Ava', excerpt: 'Hello' })), /<button/);
});

test('ringState: fraction, remaining, tone and countdown thresholds', () => {
  assert.deepEqual(ringState(0, 280), { fraction: 0, remaining: 280, tone: 'normal', showNumber: false });
  assert.equal(ringState(140, 280).fraction, 0.5);
  assert.deepEqual(ringState(260, 280), { fraction: 260 / 280, remaining: 20, tone: 'warning', showNumber: true });
  assert.equal(ringState(259, 280).tone, 'normal');
  assert.deepEqual(ringState(280, 280), { fraction: 1, remaining: 0, tone: 'warning', showNumber: true });
  assert.deepEqual(ringState(283, 280), { fraction: 1, remaining: -3, tone: 'danger', showNumber: true });
  assert.equal(ringState(95, 100, 5).tone, 'warning');
  assert.equal(ringState(94, 100, 5).showNumber, false);
});

test('ringState: bad input clamps instead of producing NaN', () => {
  assert.equal(ringState(Number.NaN, 100).fraction, 0);
  assert.equal(ringState(-5, 100).remaining, 100);
  assert.equal(ringState(5, Number.NaN).fraction, 1);
  assert.equal(ringState(5, 0).tone, 'danger');
  assert.equal(Number.isNaN(ringState(1, 10, Number.NaN).remaining), false);
});

test('CharacterCountRing speaks the count once, not live, and shows the number only near the limit', () => {
  assert.equal(ringAnnouncement(12), '12 characters left');
  assert.equal(ringAnnouncement(1), '1 character left');
  assert.equal(ringAnnouncement(-3), '3 characters over the limit');
  const near = html(h(CharacterCountRing, { length: 268, max: 280 }));
  assert.match(near, /data-tone="warning"/);
  assert.match(near, /data-grown/);
  assert.match(near, /cieo-sr-only">12 characters left</);
  assert.match(near, /cieo-character-count-ring-number" aria-hidden="true">12</);
  assert.doesNotMatch(near, /aria-live|role="status"/);
  const over = html(h(CharacterCountRing, { length: 283, max: 280 }));
  assert.match(over, /data-tone="danger"/);
  assert.match(over, /aria-hidden="true">-3</);
  assert.match(over, /3 characters over the limit/);
  const far = html(h(CharacterCountRing, { length: 10, max: 280 }));
  assert.doesNotMatch(far, /ring-number|data-grown/);
  assert.match(far, /stroke-dashoffset:/);
});

test('Comment: article labelled by its byline; slots render in order; avatar is smaller from depth 1', () => {
  const out = html(h(Comment, { author: 'Ava', avatar: h('i', null, 'A'), time: '2h', menu: h('button', null, 'More'), attachments: h('div', { id: 'att' }), actions: h('div', { id: 'act' }), replies: h('div', { id: 'rep' }), id: 'c1' }, 'Body text'));
  assert.match(out, /^<article[^>]*id="c1"/);
  const label = /aria-labelledby="([^"]+)"/.exec(out)[1];
  assert.match(out, new RegExp(`<span id="${label.replace(/[:]/g, '\\$&')}" class="cieo cieo-by-line"`));
  assert.match(out, /data-state="default"/);
  assert.match(out, /data-depth="0"/);
  assert.match(out, /data-railed=""/);
  assert.ok(out.indexOf('Body text') < out.indexOf('id="att"') && out.indexOf('id="att"') < out.indexOf('id="act"') && out.indexOf('id="act"') < out.indexOf('id="rep"'));
  assert.match(out, /cieo-comment-line/);
  assert.doesNotMatch(out, /cieo-comment-elbow/);
  const nested = html(h(Comment, { author: 'Bo', avatar: 'B', depth: 1 }, 'hi'));
  assert.match(nested, /data-depth="1"/);
  assert.match(nested, /cieo-comment-elbow/);
  assert.doesNotMatch(nested, /cieo-comment-line|data-railed/);
});

test('Comment states: pending says Posting, failed shows the status slot, deleted keeps replies', () => {
  assert.match(html(h(Comment, { author: 'A', avatar: 'a', state: 'pending' }, 'x')), /aria-busy="true"[\s\S]*Posting…/);
  const failed = html(h(Comment, { author: 'A', avatar: 'a', state: 'failed', status: h('button', null, 'Retry') }, 'x'));
  assert.match(failed, /data-tone="danger"[^>]*>.*<button>Retry<\/button>/);
  const del = html(h(Comment, { author: 'A', avatar: 'a', state: 'deleted', replies: h('p', null, 'kept reply'), actions: h('b', null, 'like') }, 'secret body'));
  assert.match(del, /This comment was deleted/);
  assert.match(del, /kept reply/);
  assert.doesNotMatch(del, /secret body|like|cieo-by-line"/);
  assert.match(del, /aria-labelledby="([^"]+)"[\s\S]*id="\1" class="cieo-comment-deleted"/);
  assert.match(html(h(Comment, { author: 'A', avatar: 'a', state: 'highlighted' }, 'x')), /data-state="highlighted"/);
});

test('commentDepth and commentHasRail', () => {
  assert.equal(commentDepth(undefined), 0);
  assert.equal(commentDepth(-2), 0);
  assert.equal(commentDepth(Number.NaN), 0);
  assert.equal(commentDepth(2.7), 2);
  assert.equal(commentHasRail(false, false), false);
  assert.equal(commentHasRail(true, false), true);
  assert.equal(commentHasRail(false, true), true);
});

test('buildCommentTree keeps input order, makes orphans roots, drops duplicate ids and survives cycles', () => {
  const flat = [{ id: 'a', text: 'first' }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'a' }, { id: 'd', parentId: 'b' }, { id: 'x', parentId: 'missing' }, { id: 'e', parentId: null }, { id: 'a', text: 'duplicate' }];
  const tree = buildCommentTree(flat);
  assert.deepEqual(tree.map((n) => n.id), ['a', 'x', 'e']);
  assert.equal(tree[0].text, 'first');
  assert.deepEqual(tree[0].children.map((n) => n.id), ['b', 'c']);
  assert.deepEqual(tree[0].children[0].children.map((n) => n.id), ['d']);
  assert.deepEqual(buildCommentTree([]), []);
  const loop = buildCommentTree([{ id: 'p', parentId: 'q' }, { id: 'q', parentId: 'p' }, { id: 's', parentId: 's' }]);
  assert.deepEqual(loop.map((n) => n.id), ['q', 's']);
  assert.deepEqual(loop[0].children.map((n) => n.id), ['p']);
  assert.equal(loop.length, 2);
  assert.equal(countDescendants(loop[0]) + countDescendants(loop[1]) + loop.length, 3);
  assert.equal(buildCommentTree([{ id: 'k', parentId: 'k' }]).length, 1);
});

test('buildCommentTree constructs a 20,000-comment root-first chain within a bounded time', () => {
  const count = 20_000;
  const flat = Array.from({ length: count }, (_, index) => ({ id: `node-${index}`, parentId: index === 0 ? undefined : `node-${index - 1}` }));
  const startedAt = performance.now();
  const [root] = buildCommentTree(flat);
  const elapsed = performance.now() - startedAt;
  assert.equal(root.id, 'node-0');
  let node = root;
  for (let index = 0; index < count; index += 1) {
    assert.equal(node.id, `node-${index}`);
    if (index < count - 1) {
      assert.equal(node.children.length, 1);
      node = node.children[0];
    } else assert.deepEqual(node.children, []);
  }
  assert.ok(elapsed < 1_000, `20,000-comment chain took ${elapsed.toFixed(1)}ms`);
});

test('buildCommentTree carries host fields through', () => {
  const [root] = buildCommentTree([{ id: 'a', text: 'hello' }, { id: 'b', parentId: 'a', text: 'reply' }]);
  assert.equal(root.text, 'hello');
  assert.equal(root.children[0].text, 'reply');
});

test('countDescendants counts every depth once and survives a malformed cycle', () => {
  assert.equal(countDescendants(null), 0);
  assert.equal(countDescendants({ id: 'a' }), 0);
  assert.equal(countDescendants({ id: 'a', children: [{ id: 'b', children: [{ id: 'c' }] }, { id: 'd' }] }), 3);
  const a = { id: 'a', children: [] };
  const b = { id: 'b', children: [a] };
  a.children.push(b);
  assert.equal(countDescendants(a), 1);
});

test('visibleReplies shows the first N until expanded', () => {
  const kids = ['a', 'b', 'c', 'd', 'e'];
  assert.deepEqual(visibleReplies(kids, false, 2), { visible: ['a', 'b'], hidden: 3 });
  assert.deepEqual(visibleReplies(kids, true, 2), { visible: kids, hidden: 0 });
  assert.deepEqual(visibleReplies(kids, false, 9), { visible: kids, hidden: 0 });
  assert.deepEqual(visibleReplies(kids, false, 0), { visible: [], hidden: 5 });
  assert.deepEqual(visibleReplies(kids, false, -3), { visible: [], hidden: 5 });
  assert.deepEqual(visibleReplies(undefined, false, 2), { visible: [], hidden: 0 });
  assert.equal(visibleReplies(kids, false, Number.NaN).visible.length, 2);
  assert.equal(moreRepliesLabel(3), 'View 3 more replies');
  assert.equal(moreRepliesLabel(1), 'View 1 more reply');
});

test('flattenReplies lists descendants depth-first without their children', () => {
  const flat = flattenReplies([{ id: 'b', children: [{ id: 'c', children: [{ id: 'd' }] }] }, { id: 'e' }]);
  assert.deepEqual(flat.map((n) => n.id), ['b', 'c', 'd', 'e']);
  assert.ok(flat.every((n) => !n.children));
});

test('flattenReplies handles hostile depth without recursion and keeps depth-first order', () => {
  const count = 100_000;
  let child;
  for (let index = count - 1; index >= 0; index -= 1) {
    child = { id: `node-${index}`, children: child ? [child] : [] };
  }
  const flat = flattenReplies([child]);
  assert.equal(flat.length, count);
  assert.deepEqual(flat.slice(0, 3).map((node) => node.id), ['node-0', 'node-1', 'node-2']);
  assert.equal(flat.at(-1).id, `node-${count - 1}`);
  assert.ok(flat.every((node) => !node.children));
});

const people = buildCommentTree([
  { id: 'r1', name: 'Ava' },
  { id: 'r1a', parentId: 'r1', name: 'Bo' },
  { id: 'r1b', parentId: 'r1', name: 'Cy' },
  { id: 'r1c', parentId: 'r1', name: 'Di' },
  { id: 'r1d', parentId: 'r1', name: 'Ed' },
  { id: 'r1a1', parentId: 'r1a', name: 'Flo' },
  { id: 'r1a1a', parentId: 'r1a1', name: 'Gus' },
  { id: 'r1a1a1', parentId: 'r1a1a', name: 'Hal' },
  { id: 'r1a1a2', parentId: 'r1a1a', name: 'Ivy' },
]);
const render = (node, ctx) => h(Comment, { author: node.name, avatar: node.name[0], depth: ctx.depth, replies: ctx.replies, id: node.id, state: ctx.hiddenCount ? 'default' : 'default' }, `text-${node.id}`);

test('CommentThread: nested lists, reply cap with a reveal button, labelled branches', () => {
  const out = html(h(CommentThread, { label: 'Comments', items: people, renderItem: render, branchLabel: (p) => `Replies to ${p.name}` }));
  assert.match(out, /^<section[^>]*aria-label="Comments"/);
  assert.match(out, /<ul role="list"[^>]*aria-label="Replies to Ava"/);
  assert.match(out, /text-r1a/);
  assert.match(out, /text-r1b/);
  assert.doesNotMatch(out, /text-r1c|text-r1d/);
  assert.match(out, /<button type="button" class="cieo-comment-thread-more">View 2 more replies<\/button>/);
  assert.equal((out.match(/<li /g) ?? []).length > 4, true);
});

test('CommentThread: expanded ids reveal everything in that branch (controlled)', () => {
  const out = html(h(CommentThread, { label: 'Comments', items: people, renderItem: render, expanded: ['r1'] }));
  assert.match(out, /text-r1c/);
  assert.match(out, /text-r1d/);
  assert.doesNotMatch(out, /View 2 more replies/);
});

test('CommentThread: replies past maxDepth show at maxDepth, flattened, never nested further', () => {
  const seen = [];
  const out = html(h(CommentThread, { label: 'Comments', items: people, expanded: ['r1', 'r1a'], maxDepth: 2, renderItem: (n, ctx) => { seen.push([n.id, ctx.depth, ctx.hasReplies]); return render(n, ctx); } }));
  assert.deepEqual(seen.find((s) => s[0] === 'r1a1'), ['r1a1', 2, false]);
  assert.deepEqual(seen.find((s) => s[0] === 'r1a1a'), ['r1a1a', 2, false]);
  assert.deepEqual(seen.find((s) => s[0] === 'r1a1a1'), ['r1a1a1', 2, false]);
  assert.equal(Math.max(...seen.map((s) => s[1])), 2);
  assert.match(out, /text-r1a1a2/);
});

test('CommentThread clamps pathological maxDepth before recursively rendering', () => {
  const count = 80;
  const root = { id: 'depth-0', children: [] };
  let parent = root;
  for (let index = 1; index < count; index += 1) {
    const child = { id: `depth-${index}`, children: [] };
    parent.children.push(child);
    parent = child;
  }
  const seen = [];
  const out = html(h(CommentThread, {
    label: 'Comments',
    items: [root],
    maxDepth: Number.MAX_SAFE_INTEGER,
    initialReplies: count,
    renderItem: (node, context) => {
      seen.push({ id: node.id, depth: context.depth, hasReplies: context.hasReplies });
      return h('span', null, node.id, context.replies);
    },
  }));
  assert.equal(seen.length, count);
  assert.equal(Math.max(...seen.map((entry) => entry.depth)), 32);
  assert.ok(seen.filter((entry) => entry.depth === 32).every((entry) => !entry.hasReplies));
  assert.match(out, /depth-79/);
});

test('CommentThread: newIds mark rows for the rise-in; ctx reports hiddenCount and depth', () => {
  const ctxs = {};
  const out = html(h(CommentThread, { label: 'Comments', items: people, newIds: ['r1'], renderItem: (n, ctx) => { ctxs[n.id] = ctx; return render(n, ctx); } }));
  assert.match(out, /<li[^>]*class="cieo-comment-thread-item"[^>]*data-new=""/);
  assert.equal(ctxs.r1.hiddenCount, 2);
  assert.equal(ctxs.r1.hasReplies, true);
  assert.equal(ctxs.r1a.depth, 1);
  assert.equal(ctxs.r1b.hasReplies, false);
});

test('composerCanSubmit covers empty, whitespace, attachments, limit, pending and disabled', () => {
  assert.equal(composerCanSubmit({ value: '' }), false);
  assert.equal(composerCanSubmit({ value: '   \n' }), false);
  assert.equal(composerCanSubmit({ value: 'hi' }), true);
  assert.equal(composerCanSubmit({ value: '', hasAttachments: true }), true);
  assert.equal(composerCanSubmit({ value: 'hello', maxLength: 5 }), true);
  assert.equal(composerCanSubmit({ value: 'hello!', maxLength: 5 }), false);
  assert.equal(composerCanSubmit({ value: 'hi', pending: true }), false);
  assert.equal(composerCanSubmit({ value: 'hi', disabled: true }), false);
  assert.equal(composerCanSubmit({ value: '', hasAttachments: true, pending: true }), false);
  assert.equal(composerLength('a😀b'), 3);
  assert.equal(composerCanSubmit({ value: '😀😀', maxLength: 2 }), true);
});

test('composerShowsCount appears at 80% of the limit only when there is a limit', () => {
  assert.equal(composerShowsCount(79, 100), false);
  assert.equal(composerShowsCount(80, 100), true);
  assert.equal(composerShowsCount(500, undefined), false);
  assert.equal(composerShowsCount(5, 0), false);
});

test('composerKeyAction: Cmd/Ctrl+Enter posts, Enter is a newline, Escape cancels a reply, IME never acts', () => {
  assert.equal(composerKeyAction({ key: 'Enter', metaKey: true }, false), 'submit');
  assert.equal(composerKeyAction({ key: 'Enter', ctrlKey: true }, false), 'submit');
  assert.equal(composerKeyAction({ key: 'Enter' }, false), null);
  assert.equal(composerKeyAction({ key: 'Escape' }, true), 'cancel-reply');
  assert.equal(composerKeyAction({ key: 'Escape' }, false), null);
  assert.equal(composerKeyAction({ key: 'Enter', metaKey: true, isComposing: true }, false), null);
});

const composer = (props) => html(h(CommentComposer, { value: '', onValueChange() {}, onSubmit() {}, ...props }));

test('CommentComposer: form with named input, placeholder, disabled post button when empty', () => {
  const out = composer({});
  assert.match(out, /<form[^>]*aria-label="Add to thread"/);
  assert.match(out, /<textarea[^>]*aria-label="Add to thread"/);
  assert.match(out, /placeholder="Add to thread…"/);
  assert.match(out, /<button type="submit"[^>]*disabled=""/);
  assert.match(out, />Post</);
  assert.doesNotMatch(composer({ value: 'hi' }), /type="submit"[^>]*disabled/);
  assert.doesNotMatch(composer({ hasAttachments: true }), /type="submit"[^>]*disabled/);
  assert.match(composer({ value: 'hi', pending: true }), /aria-busy="true"[^>]*disabled=""|disabled=""[^>]*aria-busy="true"/);
});

test('CommentComposer: slots, reply preview and the count ring appear only when relevant', () => {
  const out = composer({ avatar: h('i', null, 'me'), tools: h('button', { id: 't' }), attachments: h('div', { id: 'at' }), replyingTo: { author: 'Ava', excerpt: 'first' }, onCancelReply() {} });
  assert.match(out, /role="group" aria-label="Add to your post"/);
  assert.match(out, /id="at"/);
  assert.match(out, /data-variant="composer"/);
  assert.match(out, /aria-label="Cancel reply to Ava"/);
  assert.doesNotMatch(out, /cieo-character-count-ring/);
  assert.doesNotMatch(composer({ value: 'x'.repeat(10), maxLength: 100 }), /cieo-character-count-ring/);
  assert.match(composer({ value: 'x'.repeat(85), maxLength: 100 }), /cieo-character-count-ring/);
  const over = composer({ value: 'x'.repeat(101), maxLength: 100 });
  assert.match(over, /1 character over the limit/);
  assert.match(over, /type="submit"[^>]*disabled=""/);
});

test('CommentComposer: a recorder replaces the text input', () => {
  const out = composer({ recorder: h('div', { id: 'rec' }, 'recording') });
  assert.match(out, /data-pane="recorder"/);
  assert.match(out, /id="rec"/);
  assert.doesNotMatch(out, /<textarea/);
  assert.match(composer({}), /<textarea/);
  assert.match(composer({ disabled: true }), /<textarea[^>]*disabled=""/);
});

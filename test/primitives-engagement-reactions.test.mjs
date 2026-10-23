// test/primitives-engagement-reactions.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactionPicker, DEFAULT_REACTIONS, pickerStartIndex } from '../dist/primitives/ReactionPicker/ReactionPicker.js';
import { ReactionSummary, toggleReaction, reactionName, reactionDiff } from '../dist/primitives/ReactionSummary/ReactionSummary.js';
import { Poll, pollPercentages, pollAnnouncement } from '../dist/primitives/Poll/Poll.js';
import { ThumbsFeedback, thumbsStep, THUMBS_INITIAL } from '../dist/primitives/ThumbsFeedback/ThumbsFeedback.js';

const noop = () => {};

test('DEFAULT_REACTIONS are the six agreed reactions in order', () => {
  assert.deepEqual(DEFAULT_REACTIONS.map((r) => r.id), ['like', 'love', 'laugh', 'wow', 'sad', 'thanks']);
  assert.deepEqual(DEFAULT_REACTIONS.map((r) => r.label), ['Like', 'Love', 'Funny', 'Wow', 'Sad', 'Thanks']);
  assert.ok(DEFAULT_REACTIONS.every((r) => r.emoji.length > 0));
});

test('ReactionPicker renders a labelled toolbar of named buttons with one tab stop', () => {
  const html = renderToStaticMarkup(h(ReactionPicker, { onPick: noop, selected: ['love'] }));
  assert.match(html, /role="toolbar"/);
  assert.match(html, /aria-label="Add a reaction"/);
  assert.equal((html.match(/<button/g) ?? []).length, 6);
  assert.match(html, /<button(?=[^>]*aria-label="Funny")/);
  assert.match(html, /<button(?=[^>]*aria-label="Love")(?=[^>]*aria-pressed="true")(?=[^>]*tabindex="0")/);
  assert.match(html, /<button(?=[^>]*aria-label="Like")(?=[^>]*aria-pressed="false")(?=[^>]*tabindex="-1")/);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
  assert.match(html, /--cieo-i:5/);
});

test('ReactionPicker honours custom reactions and label; emoji are hidden from assistive tech', () => {
  const html = renderToStaticMarkup(h(ReactionPicker, { onPick: noop, label: 'React', reactions: [{ id: 'a', emoji: '🔥', label: 'Fire' }] }));
  assert.match(html, /aria-label="React"/);
  assert.match(html, /<button(?=[^>]*aria-label="Fire")/);
  assert.match(html, /<span aria-hidden="true"[^>]*>🔥<\/span>/);
  assert.equal(pickerStartIndex([], []), 0);
  assert.equal(pickerStartIndex(DEFAULT_REACTIONS, ['wow']), 3);
  assert.equal(pickerStartIndex(DEFAULT_REACTIONS, ['nope']), 0);
});

test('toggleReaction: off decrements, removes at 0; on increments or appends; never mutates', () => {
  const list = [{ id: 'love', emoji: '❤️', label: 'Love', count: 3, mine: true }, { id: 'like', emoji: '👍', label: 'Like', count: 1, mine: true }, { id: 'wow', emoji: '😮', label: 'Wow', count: 2 }];
  const frozen = JSON.stringify(list);
  const off = toggleReaction(list, 'love');
  assert.deepEqual(off[0], { id: 'love', emoji: '❤️', label: 'Love', count: 2, mine: false });
  assert.deepEqual(toggleReaction(list, 'like').map((r) => r.id), ['love', 'wow']);
  assert.deepEqual(toggleReaction(list, 'wow')[2], { id: 'wow', emoji: '😮', label: 'Wow', count: 3, mine: true });
  const added = toggleReaction(list, 'sad', '😢', 'Sad');
  assert.deepEqual(added[3], { id: 'sad', emoji: '😢', label: 'Sad', count: 1, mine: true });
  assert.deepEqual(toggleReaction([], 'x')[0], { id: 'x', emoji: 'x', label: 'x', count: 1, mine: true });
  assert.equal(JSON.stringify(list), frozen);
  const there = toggleReaction(toggleReaction(list, 'wow'), 'wow');
  assert.deepEqual(there, [list[0], list[1], { ...list[2], mine: false }]);
});

test('reactionName speaks the count and whether you are in it', () => {
  assert.equal(reactionName({ id: 'l', emoji: '❤️', label: 'Love', count: 3, mine: true }), 'Love, 3 people including you');
  assert.equal(reactionName({ id: 'l', emoji: '❤️', label: 'Love', count: 2 }), 'Love, 2 people');
  assert.equal(reactionName({ id: 'l', emoji: '❤️', label: 'Love', count: 1 }), 'Love, 1 person');
  assert.equal(reactionName({ id: 'l', emoji: '❤️', label: 'Love', count: 1, mine: true }), 'Love, just you');
  assert.equal(reactionName({ id: 'l', emoji: '❤️', label: 'Love', count: Number.NaN }), 'Love, 0 people');
});

test('reactionDiff finds entering ids and leaving chips with their old position', () => {
  const a = { id: 'a', emoji: 'a', label: 'A', count: 1 };
  const b = { id: 'b', emoji: 'b', label: 'B', count: 1 };
  const c = { id: 'c', emoji: 'c', label: 'C', count: 1 };
  const d = reactionDiff([a, b], [b, c]);
  assert.deepEqual(d.entering, ['c']);
  assert.deepEqual(d.leaving, [{ at: 0, chip: a }]);
  assert.deepEqual(reactionDiff([a], [a]), { entering: [], leaving: [] });
});

test('ReactionSummary SSR: chips are toggles with spoken names; mine is marked; add button only when onAdd', () => {
  const reactions = [{ id: 'love', emoji: '❤️', label: 'Love', count: 3, mine: true }, { id: 'wow', emoji: '😮', label: 'Wow', count: 1200 }];
  const html = renderToStaticMarkup(h(ReactionSummary, { reactions, onToggle: noop }));
  assert.match(html, /role="group"[^>]*aria-label="Reactions"|aria-label="Reactions"[^>]*role="group"/);
  assert.match(html, /<button(?=[^>]*aria-label="Love, 3 people including you")(?=[^>]*aria-pressed="true")(?=[^>]*data-mine)/);
  assert.match(html, /<button(?=[^>]*aria-label="Wow, 1200 people")(?=[^>]*aria-pressed="false")/);
  assert.doesNotMatch(html, /Add a reaction/);
  assert.doesNotMatch(html, /data-entering|data-leaving/);
  const withAdd = renderToStaticMarkup(h(ReactionSummary, { reactions, onToggle: noop, onAdd: noop }));
  assert.match(withAdd, /<button(?=[^>]*aria-label="Add a reaction")/);
  assert.match(withAdd, /aria-haspopup="dialog"/);
  assert.match(withAdd, /aria-expanded="false"/);
});

test('pollPercentages sums to exactly 100 and handles edges', () => {
  assert.deepEqual(pollPercentages([1, 1, 1]), [34, 33, 33]);
  assert.deepEqual(pollPercentages([0, 0]), [0, 0]);
  assert.deepEqual(pollPercentages([]), []);
  assert.deepEqual(pollPercentages([5]), [100]);
  assert.deepEqual(pollPercentages([1, 0]), [100, 0]);
  assert.deepEqual(pollPercentages([Number.NaN, -4, 2]), [0, 0, 100]);
  for (const votes of [[1, 2, 3, 4, 5, 6, 7], [33, 33, 34], [1, 1, 1, 1, 1, 1, 1], [999, 1, 0, 17], [2, 2]]) {
    const pct = pollPercentages(votes);
    assert.equal(pct.reduce((a, b) => a + b, 0), 100, votes.join());
    assert.ok(pct.every((p) => Number.isInteger(p) && p >= 0));
  }
  assert.deepEqual(pollPercentages([54, 46]), [54, 46]);
});

const options = [{ id: 'a', label: 'Option A', votes: 54 }, { id: 'b', label: 'Option B', votes: 46 }];

test('pollAnnouncement names the leader, ties and empty polls', () => {
  assert.equal(pollAnnouncement(options), 'Vote counted. Option A leads with 54%.');
  assert.equal(pollAnnouncement([{ id: 'a', label: 'A', votes: 1 }, { id: 'b', label: 'B', votes: 1 }]), 'Vote counted. A and B are tied at 50%.');
  assert.equal(pollAnnouncement([{ id: 'a', label: 'A', votes: 0 }]), 'Vote counted.');
});

test('Poll before voting is a radiogroup of buttons with no results', () => {
  const html = renderToStaticMarkup(h(Poll, { question: 'Which?', options, onVote: noop }));
  assert.match(html, /role="radiogroup"/);
  assert.equal((html.match(/role="radio"/g) ?? []).length, 2);
  assert.match(html, /<button(?=[^>]*role="radio")(?=[^>]*aria-checked="false")(?=[^>]*tabindex="0")/);
  assert.doesNotMatch(html, /role="list"/);
  assert.doesNotMatch(html, /data-leader|Your vote/);
  assert.match(html, /role="status"[^>]*aria-live="polite"[^>]*><\/span>/);
  assert.match(html, /data-state="choice"/);
});

test('Poll after voting shows result rows, the chosen check, leader and total; announcement starts empty', () => {
  const html = renderToStaticMarkup(h(Poll, { question: 'Which?', options, voted: 'b', onVote: noop, footnote: 'Closes Friday' }));
  assert.match(html, /role="list"/);
  assert.doesNotMatch(html, /role="radio"/);
  assert.equal((html.match(/role="listitem"/g) ?? []).length, 2);
  assert.match(html, /data-chosen=""[^>]*>/);
  assert.equal((html.match(/data-leader/g) ?? []).length, 1);
  assert.match(html, /Your vote/);
  assert.match(html, /54%, 54 votes/);
  assert.match(html, /46%, 46 votes/);
  assert.match(html, /--cieo-poll-fill:54%/);
  assert.match(html, /100 votes/);
  assert.match(html, /Closes Friday/);
  assert.match(html, /role="status"[^>]*aria-live="polite"[^>]*><\/span>/);
});

test('Poll closed shows results without a vote; zero votes show zeros and no leader', () => {
  const closed = renderToStaticMarkup(h(Poll, { question: 'Which?', options, closed: true, onVote: noop }));
  assert.match(closed, /data-closed=""/);
  assert.match(closed, /Closed/);
  assert.doesNotMatch(closed, /Your vote/);
  const empty = renderToStaticMarkup(h(Poll, { question: 'Which?', options: options.map((o) => ({ ...o, votes: 0 })), closed: true, onVote: noop }));
  assert.doesNotMatch(empty, /data-leader/);
  assert.match(empty, /0%, 0 votes/);
});

test('thumbsStep: ask -> detail -> done, skipping detail without reasons', () => {
  let s = thumbsStep(THUMBS_INITIAL, { type: 'rate', value: 'up', hasReasons: true });
  assert.deepEqual(s, { step: 'detail', value: 'up' });
  s = thumbsStep(s, { type: 'rate', value: 'down', hasReasons: true });
  assert.deepEqual(s, { step: 'detail', value: 'down' });
  assert.deepEqual(thumbsStep(s, { type: 'submit' }), { step: 'done', value: 'down' });
  assert.deepEqual(thumbsStep(s, { type: 'skip' }), { step: 'done', value: 'down' });
  assert.deepEqual(thumbsStep(THUMBS_INITIAL, { type: 'rate', value: 'up', hasReasons: false }), { step: 'done', value: 'up' });
  const done = { step: 'done', value: 'up' };
  assert.equal(thumbsStep(done, { type: 'rate', value: 'down', hasReasons: true }), done);
  assert.equal(thumbsStep(done, { type: 'submit' }), done);
  assert.equal(thumbsStep(THUMBS_INITIAL, { type: 'submit' }), THUMBS_INITIAL);
  assert.equal(thumbsStep(THUMBS_INITIAL, { type: 'skip' }), THUMBS_INITIAL);
});

test('ThumbsFeedback SSR: ask step has two named thumb buttons and the question', () => {
  const html = renderToStaticMarkup(h(ThumbsFeedback, { onSubmit: noop, reasons: { up: ['Clear'], down: ['Confusing'] } }));
  assert.match(html, /Was this helpful\?/);
  assert.match(html, /data-step="ask"/);
  assert.match(html, /<button(?=[^>]*aria-label="Yes, helpful")(?=[^>]*aria-pressed="false")/);
  assert.match(html, /<button(?=[^>]*aria-label="No, not helpful")(?=[^>]*aria-pressed="false")/);
  assert.doesNotMatch(html, /cieo-thumbs-reason|textarea/);
  const custom = renderToStaticMarkup(h(ThumbsFeedback, { onSubmit: noop, question: 'Useful?' }));
  assert.match(custom, /Useful\?/);
});

test('ThumbsFeedback marks its leaving view inert with a real boolean, not an empty string (React 19 warns on inert="")', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../src/primitives/ThumbsFeedback/ThumbsFeedback.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /inert:\s*''/);
  assert.match(src, /cieo-thumbs-leaving"[^>]*\sinert[\s>]/);
});

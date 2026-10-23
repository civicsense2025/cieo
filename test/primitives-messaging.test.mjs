// test/primitives-messaging.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TypingIndicator, typingLabel, typingSetKey } from '../dist/primitives/TypingIndicator/TypingIndicator.js';
import { DeliveryStatus, deliveryLabel } from '../dist/primitives/DeliveryStatus/DeliveryStatus.js';
import { SeenBy, seenByLabel } from '../dist/primitives/SeenBy/SeenBy.js';
import { UnreadDivider, unreadDividerLabel } from '../dist/primitives/UnreadDivider/UnreadDivider.js';
import { GroupAvatar, groupAvatarLabel, groupAvatarLayout, listNames } from '../dist/primitives/GroupAvatar/GroupAvatar.js';
import { ConversationListItem, conversationLabel, nodeText, unreadBadgeText } from '../dist/primitives/ConversationListItem/ConversationListItem.js';
import { ConversationList, conversationIds, conversationOrder, conversationRove, conversationTabbable } from '../dist/primitives/ConversationList/ConversationList.js';

const person = (name, extra = {}) => ({ name, initials: name.slice(0, 2).toUpperCase(), ...extra });

test('typingLabel words one to many people and ignores blanks', () => {
  assert.equal(typingLabel([]), '');
  assert.equal(typingLabel(['  ', '']), '');
  assert.equal(typingLabel(['Ava']), 'Ava is typing');
  assert.equal(typingLabel(['Ava', 'Ben']), 'Ava and Ben are typing');
  assert.equal(typingLabel(['Ava', 'Ben', 'Cy']), 'Ava, Ben and Cy are typing');
  assert.equal(typingLabel(['Ava', 'Ben', 'Cy', 'Di']), 'Ava and 3 others are typing');
  assert.equal(typingLabel(['Ava', 'Ben', 'Cy', 'Di', 'Ed', 'Flo']), 'Ava and 5 others are typing');
});

test('typingSetKey ignores order, repeats and blanks so the spoken text only changes with the set', () => {
  assert.equal(typingSetKey(['Ben', 'Ava']), typingSetKey(['Ava', 'Ben', 'Ava', ' ']));
  assert.notEqual(typingSetKey(['Ava']), typingSetKey(['Ava', 'Ben']));
  assert.equal(typingSetKey([]), '');
});

test('TypingIndicator renders a status with three decorative dots and the sentence', () => {
  const bubble = renderToStaticMarkup(h(TypingIndicator, { names: ['Ava', 'Ben'] }));
  assert.match(bubble, /role="status"/);
  assert.match(bubble, /data-variant="bubble"/);
  assert.equal((bubble.match(/cieo-typing-indicator-dot"/g) ?? []).length, 3);
  assert.match(bubble, /class="cieo-sr-only">Ava and Ben are typing</);
  const inline = renderToStaticMarkup(h(TypingIndicator, { names: ['Ava'], variant: 'inline' }));
  assert.match(inline, /class="cieo-typing-indicator-text">Ava is typing</);
});

test('TypingIndicator with nobody typing renders an empty status that stays hidden', () => {
  const html = renderToStaticMarkup(h(TypingIndicator, { names: [] }));
  assert.match(html, /role="status"/);
  assert.match(html, /data-empty=""/);
  assert.doesNotMatch(html, /dot/);
});

test('deliveryLabel names every state', () => {
  assert.deepEqual(['sending', 'sent', 'delivered', 'read', 'failed'].map(deliveryLabel), ['Sending', 'Sent', 'Delivered', 'Read', 'Not delivered']);
});

test('DeliveryStatus speaks the state, carries it for the CSS, and only failure is an alert', () => {
  for (const status of ['sending', 'sent', 'delivered', 'read']) {
    const html = renderToStaticMarkup(h(DeliveryStatus, { status }));
    assert.match(html, new RegExp(`data-status="${status}"`));
    assert.doesNotMatch(html, /role=/);
    assert.match(html, new RegExp(`cieo-sr-only">${deliveryLabel(status)}<`));
  }
  const failed = renderToStaticMarkup(h(DeliveryStatus, { status: 'failed' }));
  assert.match(failed, /role="alert"/);
  assert.match(failed, /Not delivered/);
  const timed = renderToStaticMarkup(h(DeliveryStatus, { status: 'read', time: '9:41 AM' }));
  assert.match(timed, /cieo-sr-only">Read, 9:41 AM</);
});

test('seenByLabel and listNames summarise readers', () => {
  assert.equal(seenByLabel([]), '');
  assert.equal(seenByLabel(['Ava']), 'Seen by Ava');
  assert.equal(seenByLabel(['Ava', 'Ben']), 'Seen by Ava and Ben');
  assert.equal(seenByLabel(['Ava', 'Ben', 'Cy']), 'Seen by Ava, Ben and Cy');
  assert.equal(seenByLabel(['Ava', 'Ben', 'Cy', 'Di']), 'Seen by Ava, Ben and 2 others');
  assert.equal(listNames([' ', 'Ava']), 'Ava');
});

test('SeenBy shows up to max faces, then +n, and hides nothing from screen readers', () => {
  const people = ['Ava', 'Ben', 'Cy', 'Di', 'Ed'].map((n) => person(n));
  const html = renderToStaticMarkup(h(SeenBy, { people }));
  assert.equal((html.match(/cieo-seen-by-initials/g) ?? []).length, 3);
  assert.match(html, />\+2</);
  assert.match(html, /cieo-sr-only">Seen by Ava, Ben and 3 others</);
  assert.match(renderToStaticMarkup(h(SeenBy, { people, max: 10 })), /^(?!.*\+\d)/);
  assert.equal(renderToStaticMarkup(h(SeenBy, { people: [] })), '');
  assert.equal((renderToStaticMarkup(h(SeenBy, { people, max: 0 })).match(/cieo-seen-by-initials/g) ?? []).length, 1);
});

test('SeenBy uses a photo only when src is given', () => {
  const html = renderToStaticMarkup(h(SeenBy, { people: [person('Ava', { src: '/ava.jpg' }), person('Ben')] }));
  assert.equal((html.match(/<img /g) ?? []).length, 1);
  assert.match(html, /src="\/ava\.jpg"/);
});

test('unreadDividerLabel prefers the host label, then a count, then the default', () => {
  assert.equal(unreadDividerLabel(), 'New messages');
  assert.equal(unreadDividerLabel(3), '3 new messages');
  assert.equal(unreadDividerLabel(1), '1 new message');
  assert.equal(unreadDividerLabel(0), 'New messages');
  assert.equal(unreadDividerLabel(Number.NaN), 'New messages');
  assert.equal(unreadDividerLabel(-2), 'New messages');
  assert.equal(unreadDividerLabel(2.9), '2 new messages');
  assert.equal(unreadDividerLabel(3, 'Nouveaux messages'), 'Nouveaux messages');
  assert.equal(unreadDividerLabel(3, '  '), '3 new messages');
});

test('UnreadDivider is a labelled separator with one rule on each side', () => {
  const html = renderToStaticMarkup(h(UnreadDivider, { count: 3 }));
  assert.match(html, /role="separator"/);
  assert.match(html, /aria-label="3 new messages"/);
  assert.equal((html.match(/cieo-unread-divider-rule/g) ?? []).length, 2);
  assert.match(renderToStaticMarkup(h(UnreadDivider, {})), /aria-label="New messages"/);
});

test('groupAvatarLabel and layout: faces up to four, then three plus a +n tile', () => {
  assert.equal(groupAvatarLabel(['Ava', 'Ben', 'Cy', 'Di', 'Ed']), 'Ava, Ben and 3 others');
  assert.equal(groupAvatarLabel(['Ava', 'Ben']), 'Ava and Ben');
  assert.equal(groupAvatarLabel([]), '');
  const ids = (n) => Array.from({ length: n }, (_, i) => i);
  for (const n of [1, 2, 3, 4]) assert.deepEqual(groupAvatarLayout(ids(n)), { faces: ids(n), more: 0 });
  assert.deepEqual(groupAvatarLayout(ids(5)), { faces: [0, 1, 2], more: 2 });
  assert.deepEqual(groupAvatarLayout(ids(12)), { faces: [0, 1, 2], more: 9 });
  assert.deepEqual(groupAvatarLayout([]), { faces: [], more: 0 });
});

test('GroupAvatar is one labelled image with the right number of slots per layout', () => {
  const make = (n, props = {}) => renderToStaticMarkup(h(GroupAvatar, { people: Array.from({ length: n }, (_, i) => person(`P${i}`)), ...props }));
  for (const n of [1, 2, 3, 4]) {
    const html = make(n);
    assert.match(html, /role="img"/);
    assert.match(html, new RegExp(`data-count="${n}"`));
    assert.equal((html.match(/class="cieo-group-avatar-face"/g) ?? []).length, n);
  }
  const many = make(7, { size: 'lg' });
  assert.match(many, /data-count="4"/);
  assert.match(many, /data-size="lg"/);
  assert.match(many, /cieo-group-avatar-more[^>]*>\+4</);
  assert.match(many, /aria-label="P0, P1 and 5 others"/);
  assert.equal(renderToStaticMarkup(h(GroupAvatar, { people: [] })), '');
});

test('GroupAvatar never guesses a photo', () => {
  const html = renderToStaticMarkup(h(GroupAvatar, { people: [person('Ava', { src: '/a.jpg' }), person('Ben')] }));
  assert.equal((html.match(/<img /g) ?? []).length, 1);
});

test('nodeText reads strings, numbers and nested elements, and skips hidden or empty parts', () => {
  assert.equal(nodeText('hi'), 'hi');
  assert.equal(nodeText(3), '3');
  assert.equal(nodeText(null), '');
  assert.equal(nodeText(false), '');
  assert.equal(nodeText(h('span', null, 'Ava: ', h('b', null, 'see you'), ' at ', 3)), 'Ava: see you at 3');
  assert.equal(nodeText(h('span', null, 'a', h('i', { 'aria-hidden': 'true' }, 'icon'), 'b')), 'ab');
});

test('unreadBadgeText clamps and caps', () => {
  assert.equal(unreadBadgeText(3), '3');
  assert.equal(unreadBadgeText(99), '99');
  assert.equal(unreadBadgeText(100), '99+');
  assert.equal(unreadBadgeText(-4), '0');
  assert.equal(unreadBadgeText(Number.NaN), '0');
  assert.equal(unreadBadgeText(2.8), '2');
});

test('conversationLabel summarises a row for screen readers', () => {
  assert.equal(conversationLabel({ title: 'Design team', unread: 3, preview: 'Ava: see you at 3', time: '9:41 AM' }), 'Design team, 3 unread, Ava: see you at 3, 9:41 AM');
  assert.equal(conversationLabel({ title: 'Ben' }), 'Ben');
  assert.equal(conversationLabel({ title: 'Ben', unread: 0, muted: true, pinned: true, preview: 'ok' }), 'Ben, muted, pinned, ok');
  assert.equal(conversationLabel({ title: 'Ben', draft: true, preview: 'maybe' }), 'Ben, Draft: maybe');
  assert.equal(conversationLabel({ title: 'Ben', preview: 'old news', typing: ['Ben', 'Cy'] }), 'Ben, Ben and Cy are typing');
  assert.equal(conversationLabel({ title: 'Ben', unread: Number.NaN }), 'Ben');
});

test('ConversationListItem renders a button row with the summary, time and badge', () => {
  const html = renderToStaticMarkup(
    h(ConversationListItem, { id: 'c1', title: 'Design team', avatar: h('span', null, 'DT'), preview: 'Ava: see you at 3', time: '9:41 AM', dateTime: '2026-10-23T09:41', unread: 3, selected: true }),
  );
  assert.match(html, /role="listitem"/);
  assert.match(html, /<button type="button"/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /aria-label="Design team, 3 unread, Ava: see you at 3, 9:41 AM"/);
  assert.match(html, /<time dateTime="2026-10-23T09:41"|<time datetime="2026-10-23T09:41"/i);
  assert.match(html, /cieo-conversation-list-item-badge[^>]*><span[^>]*>3</);
  assert.match(html, /data-unread=""/);
  assert.match(html, /data-conversation-id="c1"/);
});

test('ConversationListItem with an href is a link; without unread there is no badge or current marker', () => {
  const html = renderToStaticMarkup(h(ConversationListItem, { id: 'c2', title: 'Ben', avatar: null, href: '/chat/c2' }));
  assert.match(html, /<a href="\/chat\/c2"/);
  assert.doesNotMatch(html, /badge/);
  assert.doesNotMatch(html, /aria-current/);
  assert.doesNotMatch(html, /data-unread/);
});

test('ConversationListItem shows draft, muted and pinned states without hiding the title', () => {
  const draft = renderToStaticMarkup(h(ConversationListItem, { id: 'd', title: 'Cy', avatar: null, preview: 'hello', draft: true }));
  assert.match(draft, /cieo-conversation-list-item-draft">Draft: </);
  const muted = renderToStaticMarkup(h(ConversationListItem, { id: 'm', title: 'Cy', avatar: null, muted: true, unread: 2 }));
  assert.match(muted, /data-muted=""/);
  assert.match(muted, /badge/);
  const pinned = renderToStaticMarkup(h(ConversationListItem, { id: 'p', title: 'Cy', avatar: null, pinned: true }));
  assert.match(pinned, /data-pinned=""/);
  assert.match(pinned, /cieo-conversation-list-item-icon/);
  const pinnedUnread = renderToStaticMarkup(h(ConversationListItem, { id: 'p', title: 'Cy', avatar: null, pinned: true, unread: 1 }));
  assert.doesNotMatch(pinnedUnread, /cieo-conversation-list-item-icon/);
});

test('ConversationListItem swaps the preview for typing while keeping the preview text', () => {
  const html = renderToStaticMarkup(h(ConversationListItem, { id: 't', title: 'Cy', avatar: null, preview: 'earlier', typing: ['Ava'] }));
  assert.match(html, /cieo-conversation-list-item-preview" data-hidden=""/);
  assert.match(html, /cieo-conversation-list-item-typing" data-shown=""/);
  assert.match(html, /Ava is typing/);
  const idle = renderToStaticMarkup(h(ConversationListItem, { id: 't', title: 'Cy', avatar: null, preview: 'earlier' }));
  assert.doesNotMatch(idle, /data-hidden|data-shown/);
});

test('conversationIds, conversationOrder and conversationTabbable', () => {
  const kids = [h(ConversationListItem, { id: 'a', title: 'A', avatar: null }), 'stray', h('div', null), h(ConversationListItem, { id: 'b', title: 'B', avatar: null }), h(ConversationListItem, { id: 'c', title: 'C', avatar: null })];
  assert.deepEqual(conversationIds(kids), ['a', 'b', 'c']);
  assert.deepEqual(conversationOrder(['a', 'b', 'c']), ['a', 'b', 'c']);
  assert.deepEqual(conversationOrder(['a', 'b', 'c'], ['c', 'a']), ['c', 'a', 'b']);
  assert.deepEqual(conversationOrder(['a', 'b', 'c'], ['z', 'b', 'b']), ['b', 'a', 'c']);
  assert.deepEqual(conversationOrder([], ['a']), []);
  assert.equal(conversationTabbable(['a', 'b'], 'b', 'a'), 'b');
  assert.equal(conversationTabbable(['a', 'b'], 'gone', 'b'), 'b');
  assert.equal(conversationTabbable(['a', 'b'], null, 'gone'), 'a');
  assert.equal(conversationTabbable([], null), null);
});

test('conversationRove: arrows step, Home/End jump, and the ends do not wrap', () => {
  assert.equal(conversationRove('ArrowDown', 0, 3), 1);
  assert.equal(conversationRove('ArrowUp', 2, 3), 1);
  assert.equal(conversationRove('ArrowUp', 0, 3), 0);
  assert.equal(conversationRove('ArrowDown', 2, 3), 2);
  assert.equal(conversationRove('Home', 2, 3), 0);
  assert.equal(conversationRove('End', 0, 3), 2);
  assert.equal(conversationRove('a', 0, 3), null);
  assert.equal(conversationRove('ArrowDown', 0, 0), null);
});

test('ConversationList is a named list with one tab stop, on the selected row and in the given order', () => {
  const item = (id, extra = {}) => h(ConversationListItem, { key: id, id, title: id.toUpperCase(), avatar: null, ...extra });
  const html = renderToStaticMarkup(h(ConversationList, { label: 'Conversations', order: ['c', 'a', 'b'], selectedId: 'a' }, item('a'), item('b'), item('c')));
  assert.match(html, /role="list"[^>]*aria-label="Conversations"|aria-label="Conversations"[^>]*role="list"/);
  const ids = [...html.matchAll(/data-conversation-id="(\w)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['c', 'a', 'b']);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
  assert.equal((html.match(/tabindex="-1"/g) ?? []).length, 2);
  assert.match(html, /aria-current="true"[^>]*>|data-conversation-id="a"/);
  const current = [...html.matchAll(/<button[^>]*>/g)].map((m) => m[0]).filter((t) => /aria-current/.test(t));
  assert.equal(current.length, 1);
  assert.match(current[0], /data-conversation-id="a"/);
  assert.match(current[0], /tabindex="0"/);
});

test('ConversationList without selection puts the one tab stop on the first row', () => {
  const html = renderToStaticMarkup(h(ConversationList, { label: 'Chats' }, h(ConversationListItem, { id: 'x', title: 'X', avatar: null }), h(ConversationListItem, { id: 'y', title: 'Y', avatar: null })));
  const first = [...html.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
  assert.match(first[0], /tabindex="0"/);
  assert.match(first[1], /tabindex="-1"/);
});

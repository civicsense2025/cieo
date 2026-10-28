import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

const noop = () => {};
const cases = {
  ChatMessageList: { label: 'Messages', children: 'Message' },
  AuthAccountCard: { id: 'account', name: 'Ada', email: 'ada@example.test', avatarInitials: 'A', onSignOut: noop },
  ChatLayout: { children: 'Messages', rail: 'Artifact' },
  ClickableCard: { children: h('a', { href: '/item' }, 'Open item') },
  SideNav: { children: h('a', { href: '/home' }, 'Home') },
  AuthSignInCard: { id: 'signin', onSubmit: noop },
  AuthMfaFlow: { id: 'mfa', onSubmit: noop, onRecovery: noop },
  Card: { title: 'Artwork', children: 'Image' },
  ConversationList: { label: 'Inbox', children: [] },
  AuthSignUpCard: { id: 'signup', onSubmit: noop },
  AuthResetFlow: { id: 'reset', step: 'request', onRequest: noop, onConfirm: noop },
  AnnotationLayer: { label: 'Artwork', children: 'Image', pins: [], active: false, onPlace: noop, onSelect: noop, renderPopover: noop },
  Lightbox: { src: '/fixture.png', alt: 'Artwork', open: true, motion: false },
  Carousel: { label: 'Artwork', children: 'Image' },
  AppShell: { nav: 'Navigation', children: 'Workspace' },
  Dialog: { label: 'Settings', open: true, motion: false, children: 'Settings content' },
  Table: { label: 'Files', children: h('tbody', null, h('tr', null, h('td', null, 'Artwork'))) },
  BottomSheet: { label: 'Options', open: true, motion: false, children: 'Options content' },
  CommentThread: { label: 'Comments', items: [], renderItem: noop },
  AudioRoom: { title: 'Studio', speakers: [], listenerCount: 0, self: { muted: true, handRaised: false, canSpeak: false }, onToggleMute: noop, onToggleHand: noop, onLeave: noop },
  TopNav: { children: h('a', { href: '/' }, 'Home') },
  SelectableCard: { label: 'Artwork', selected: true, children: 'Image' },
  AgentLanes: { agents: [], renderLane: noop },
  AlertDialog: { label: 'Confirm deletion', open: true, children: 'Keep or delete' },
  MobileNav: { label: 'Navigation', open: true, onClose: noop, children: h('a', { href: '/' }, 'Home') },
};

for (const [name, props] of Object.entries(cases)) {
  test(`${name} exposes root paint without leaking role, events or state overrides`, async () => {
    const C = (await import(`../dist/primitives/${name}/${name}.js`))[name];
    const baseline = render(h(C, props));
    const customized = render(h(C, { ...props, className: 'host-organism', slotProps: { root: {
      className: 'host-slot', 'data-host-proof': name, style: { color: 'red' }, role: 'presentation',
      'aria-hidden': true, 'data-state': 'forged', onClick: noop,
    } } }));
    assert.match(customized, /host-organism/);
    assert.match(customized, /host-slot/);
    assert.ok(customized.includes(`data-host-proof="${name}"`));
    assert.match(customized, /color:red/);
    assert.doesNotMatch(customized, /role="presentation"|data-state="forged"|onclick=/);
    const ownRoles = [...baseline.matchAll(/role="([^"]+)"/g)].map((match) => match[0]);
    for (const role of ownRoles) assert.ok(customized.includes(role), `${name} keeps ${role}`);
    assert.equal(render(h(C, { ...props, slotProps: {} })), baseline);
  });
}

test('composite layout slots keep host content and native landmarks', async () => {
  const { AppShell } = await import('../dist/primitives/AppShell/AppShell.js');
  const { ChatLayout } = await import('../dist/primitives/ChatLayout/ChatLayout.js');
  const app = render(h(AppShell, { nav: 'Navigation', slotProps: { navigation: { className: 'host-nav' }, content: { className: 'host-content' } } }, 'Workspace'));
  assert.match(app, /host-nav/); assert.match(app, /host-content/); assert.match(app, /Workspace/);
  const chat = render(h(ChatLayout, { rail: 'Artifact', slotProps: { transcript: { className: 'host-transcript' }, rail: { className: 'host-rail' } } }, 'Messages'));
  assert.match(chat, /data-pane="transcript"[^>]*host-transcript/); assert.match(chat, /data-pane="rail"[^>]*host-rail/);
});

test('auth content slots add context without replacing credential controls', async () => {
  for (const name of ['AuthSignInCard', 'AuthSignUpCard', 'AuthMfaFlow', 'AuthResetFlow']) {
    const C = (await import(`../dist/primitives/${name}/${name}.js`))[name];
    const baseline = render(h(C, cases[name]));
    const html = render(h(C, { ...cases[name], slots: { beforeForm: h('p', null, 'Before form'), afterForm: h('p', null, 'After form'), footer: h('a', { href: '/help' }, 'Account help') } }));
    assert.match(html, /Before form/); assert.match(html, /After form/); assert.match(html, /Account help/);
    assert.equal((html.match(/<input/g) || []).length, (baseline.match(/<input/g) || []).length);
    assert.equal((html.match(/<form/g) || []).length, (baseline.match(/<form/g) || []).length);
  }
});

test('auth custom footer receives its presentation slot and null suppresses routes', async () => {
  const { AuthSignInCard } = await import('../dist/primitives/AuthSignInCard/AuthSignInCard.js');
  const props = { id: 'signin', onSubmit: noop, resetHref: '/reset', slotProps: { footer: { className: 'host-footer' } } };
  const html = render(h(AuthSignInCard, { ...props, slots: { footer: h('a', { href: '/support' }, 'Support') } }));
  assert.match(html, /class="cieo-auth-routes host-footer"/);
  assert.match(html, /href="\/support"/);
  assert.doesNotMatch(html, /href="\/reset"/);
  const omitted = render(h(AuthSignInCard, { ...props, slots: { footer: null } }));
  assert.doesNotMatch(omitted, /cieo-auth-routes|href="\/reset"/);
});

test('recursive organism parts preserve owned marker values', async () => {
  const { AgentLanes } = await import('../dist/primitives/AgentLanes/AgentLanes.js');
  const html = render(h(AgentLanes, { agents: [{ id: 'alpha', name: 'Alpha', status: 'running', parentAgentId: null, runId: 'run', reason: null, location: null, openMessageId: null, updatedAt: '2026-10-28T00:00:00Z' }], renderLane: () => 'Work', slotProps: {
    lane: { 'data-agent-id': 'forged', 'data-depth': 99, 'data-status': 'forged' },
    name: { 'data-agent-name': 'forged', className: 'host-agent-name' },
    body: { 'data-lane-body': 'forged', className: 'host-lane-body' },
  } }));
  assert.match(html, /data-agent-id="alpha"/); assert.match(html, /data-depth="0"/);
  assert.match(html, /data-agent-name="true"/); assert.match(html, /data-lane-body="true"/);
  assert.match(html, /host-agent-name/); assert.match(html, /host-lane-body/);
  assert.doesNotMatch(html, /forged/);
});

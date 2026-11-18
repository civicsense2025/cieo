import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// A theme may make controls fully round. A box that borrows the control radius then turns into an ellipse, so
// containers (cards, banners, dialogs, popovers, toasts) take the surface radius.
const CONTAINERS = ['approval-request', 'bottom-sheet', 'card', 'collapsible', 'comment-thread', 'banner', 'popover', 'selectable-card', 'toast', 'comment', 'lightbox', 'clickable-card', 'command-palette', 'dialog', 'dropdown-menu', 'hover-card', 'poll', 'top-nav-mega-menu', 'top-nav-mega-menu-featured-card', 'tool-call-disclosure', 'activity-item', 'chat-message-bubble'];
for (const name of CONTAINERS) {
  test(`${name} is a container: it uses the surface radius, not the control radius`, () => {
    const css = readFileSync(`design/styles/primitives/${name}.css`, 'utf8');
    assert.doesNotMatch(css, /border-radius:\s*var\(--cieo-radius-control\)/);
  });
}

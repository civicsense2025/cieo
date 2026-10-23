// test/primitives-social-content.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { VerifiedBadge, verifiedBadgeSize } from '../dist/primitives/VerifiedBadge/VerifiedBadge.js';
import { Mention, normalizeHandle, safeHref } from '../dist/primitives/Mention/Mention.js';
import { RichText, tokenizeRichText, shortenUrl, trimUrl } from '../dist/primitives/RichText/RichText.js';
import { LinkPreview, displayDomain } from '../dist/primitives/LinkPreview/LinkPreview.js';
import { NewItemsPill, newItemsLabel, newItemsAnnouncement, splitNewItemsLabel, clampNewItems } from '../dist/primitives/NewItemsPill/NewItemsPill.js';

const types = (text) => tokenizeRichText(text).map((t) => `${t.type}:${t.value}`);
const links = (text) => tokenizeRichText(text).filter((t) => t.type === 'url');

test('VerifiedBadge is a named image and unknown sizes fall back to md', () => {
  const html = renderToStaticMarkup(h(VerifiedBadge, {}));
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Verified"/);
  assert.match(html, /data-size="md"/);
  assert.match(renderToStaticMarkup(h(VerifiedBadge, { label: 'Verificado', size: 'sm' })), /aria-label="Verificado"[^>]*>|data-size="sm"/);
  assert.equal(verifiedBadgeSize('sm'), 'sm');
  assert.equal(verifiedBadgeSize('huge'), 'md');
  assert.equal(verifiedBadgeSize(undefined), 'md');
});

test('normalizeHandle strips one @, trims, rejects whitespace and empties', () => {
  assert.equal(normalizeHandle('@joelw'), 'joelw');
  assert.equal(normalizeHandle('  joelw  '), 'joelw');
  assert.equal(normalizeHandle('@@joelw'), '@joelw');
  assert.equal(normalizeHandle('joel w'), '');
  assert.equal(normalizeHandle('@'), '');
  assert.equal(normalizeHandle(''), '');
  assert.equal(normalizeHandle(undefined), '');
});

test('safeHref allows http(s) and same-site paths only', () => {
  for (const ok of ['https://x.com/a', 'http://x.com', '/u/joel', '#top', '?q=1']) assert.equal(safeHref(ok), ok);
  for (const bad of ['javascript:alert(1)', ' JavaScript:alert(1)', 'java\tscript:alert(1)', 'data:text/html,hi', 'vbscript:x', '//evil.com', '/\\evil.com', 'ftp://x.com', 'mailto:a@b.com', 'https://user:pass@x.com/reset', 'https://firstnationalbank.example.com@login.evil.test/reset', '', 'x.com/a', null, 42])
    assert.equal(safeHref(bad), null, String(bad));
  assert.equal(safeHref('/u/joel', { relative: false }), null);
});

test('Mention links safe hrefs and renders text otherwise', () => {
  const link = renderToStaticMarkup(h(Mention, { handle: '@joelw', href: 'https://x.com/joelw', name: 'Joel W' }));
  assert.match(link, /<a [^>]*href="https:\/\/x\.com\/joelw"/);
  assert.match(link, /title="Joel W"/);
  assert.match(link, />@joelw</);
  const unsafe = renderToStaticMarkup(h(Mention, { handle: 'joelw', href: 'javascript:alert(1)' }));
  assert.doesNotMatch(unsafe, /<a |href=|javascript/);
  assert.match(unsafe, /<span [^>]*>@joelw<\/span>/);
  assert.equal(renderToStaticMarkup(h(Mention, { handle: '  ' })), '');
});

test('tokenizeRichText finds urls, bare domains, mentions, tags and breaks', () => {
  assert.deepEqual(types('Source: x.com/joelw\nthanks @joelw #florida'), [
    'text:Source: ', 'url:x.com/joelw', 'break:\n', 'text:thanks ', 'mention:@joelw', 'text: ', 'tag:#florida',
  ]);
  const [u] = links('x.com/joelw');
  assert.equal(u.href, 'https://x.com/joelw');
  assert.equal(links('see https://floridapolitics.com/archives/1?a=b#c now')[0].href, 'https://floridapolitics.com/archives/1?a=b#c');
  assert.equal(links('www.example.com/path')[0].href, 'https://www.example.com/path');
});

test('tokenizeRichText strips trailing punctuation from urls', () => {
  for (const end of ['.', ',', ';', ':', '!', '?', '"', "'", '?!', '.)', '…']) {
    const t = links(`go to https://a.com/x${end}`);
    assert.equal(t[0].value, 'https://a.com/x', `ending ${end}`);
  }
  assert.equal(links('(see https://a.com/x)')[0].value, 'https://a.com/x');
  assert.equal(links('https://en.wikipedia.org/wiki/Foo_(bar)')[0].value, 'https://en.wikipedia.org/wiki/Foo_(bar)');
  assert.equal(links('(https://en.wikipedia.org/wiki/Foo_(bar))')[0].value, 'https://en.wikipedia.org/wiki/Foo_(bar)');
  assert.deepEqual(trimUrl('https://a.com/x).'), { url: 'https://a.com/x', rest: ').' });
  const t = types('end https://a.com/x.');
  assert.deepEqual(t.slice(-2), ['url:https://a.com/x', 'text:.']);
});

test('tokenizeRichText never makes a link from unsafe schemes', () => {
  for (const evil of ['javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', 'file:///etc/passwd', 'ftp://x.com/a', 'blob:https://x.com/uuid', 'javascript://x.com/%0Aalert(1)']) {
    const tokens = tokenizeRichText(`click ${evil} now`);
    for (const t of tokens.filter((x) => x.type === 'url')) assert.match(t.href, /^https?:\/\//, evil);
    assert.equal(tokens.map((t) => t.value).join(''), `click ${evil} now`.replace(/\n/g, '\n'));
  }
  assert.equal(links('javascript:alert(1)').length, 0);
  assert.equal(links('data:text/html,hi').length, 0);
  const html = renderToStaticMarkup(h(RichText, { text: 'javascript:alert(1) and <script>alert(1)</script> and <img src=x onerror=alert(1)>' }));
  assert.doesNotMatch(html, /href=|<script|<img/);
  assert.match(html, /&lt;script&gt;/);
});

test('tokenizeRichText does not treat emails or mid-word @ as mentions', () => {
  assert.equal(tokenizeRichText('mail a@b.com now').some((t) => t.type === 'mention'), false);
  assert.equal(tokenizeRichText('a.b@c.org').some((t) => t.type === 'mention'), false);
  assert.equal(links('mail a@b.com now').length, 0);
  assert.equal(tokenizeRichText('@@x').some((t) => t.type === 'mention' && t.value === '@x'), false);
  assert.deepEqual(types('hi @joel.'), ['text:hi ', 'mention:@joel', 'text:.']);
  assert.deepEqual(types('(@joel)'), ['text:(', 'mention:@joel', 'text:)']);
  assert.deepEqual(types('@a_b.c'), ['mention:@a_b.c']);
  assert.deepEqual(types('@'), ['text:@']);
});

test('tokenizeRichText handles tags, emoji, newlines and empties', () => {
  assert.deepEqual(types('#fl2026 #1 a#b'), ['tag:#fl2026', 'text: #1 a#b']);
  assert.deepEqual(types('🚀 launch #Nueva_Era ❤️ @maria'), ['text:🚀 launch ', 'tag:#Nueva_Era', 'text: ❤️ ', 'mention:@maria']);
  assert.deepEqual(types('a\n\n\nb'), ['text:a', 'break:\n', 'break:\n', 'break:\n', 'text:b']);
  assert.deepEqual(types('a\r\nb'), ['text:a', 'break:\n', 'text:b']);
  assert.deepEqual(tokenizeRichText(''), []);
  assert.deepEqual(tokenizeRichText(undefined), []);
  assert.equal(links('anchor https://a.com/#frag').length, 1);
  assert.deepEqual(types('v1.2.3 and e.g. 3.5/4'), ['text:v1.2.3 and e.g. 3.5/4']);
  assert.equal(links('visit example.com today').length, 0);
});

test('tokenizeRichText is lossless: values rebuild the original text', () => {
  const samples = ['Source: x.com/joelw\n#tag @me (https://a.com/b).', 'a\n\nb', '🚀 https://a.com/x?y=1&z=2!', 'plain'];
  for (const s of samples) assert.equal(tokenizeRichText(s).map((t) => t.value).join(''), s);
});

test('shortenUrl drops scheme and www and ellipsizes the path', () => {
  assert.equal(shortenUrl('https://www.example.com/'), 'example.com');
  assert.equal(shortenUrl('http://x.com/joelw'), 'x.com/joelw');
  const long = shortenUrl('https://floridapolitics.com/archives/123456/long-story');
  assert.equal(long.length, 28);
  assert.ok(long.endsWith('…'));
  assert.ok(long.startsWith('floridapolitics.com/archive'));
  assert.equal(shortenUrl('x.com/abcdefghij', 5), 'x.com…');
  assert.equal(shortenUrl('abc', 0), '…');
  assert.equal(shortenUrl('', 10), '');
  assert.ok(Array.from(shortenUrl('https://a.com/🚀🚀🚀🚀', 9)).length <= 9);
});

test('shortenUrl preserves the parsed destination host and shortens the path', () => {
  assert.equal(shortenUrl('https://firstnationalbank.example.com/secure/reset/password', 12), 'firstnationalbank.example.com…');
  assert.equal(shortenUrl('https://news.example.co/élection/😀', 22), 'news.example.co/élect…');
});

test('shortenUrl keeps encoded display controls encoded while decoding ordinary Unicode', () => {
  assert.equal(shortenUrl('https://example.com/a%0Ab', 100), 'example.com/a%0Ab');
  assert.equal(shortenUrl('https://example.com/a%C2%85b', 100), 'example.com/a%C2%85b');
  for (const encoded of ['%E2%80%AE', '%E2%81%A6', '%D8%9C']) {
    assert.equal(shortenUrl(`https://example.com/a${encoded}b`, 100), `example.com/a${encoded}b`);
  }
  assert.equal(shortenUrl('https://example.com/a%E2%80%A8b', 100), 'example.com/a%E2%80%A8b');
  assert.equal(shortenUrl('https://example.com/a%E2%80%A9b', 100), 'example.com/a%E2%80%A9b');
  assert.equal(shortenUrl('https://example.com/%C3%A9lection', 100), 'example.com/élection');
});

test('RichText renders safe links, mentions through Mention, tags and breaks', () => {
  const html = renderToStaticMarkup(
    h(RichText, { text: 'Source: x.com/joelw\nhi @joelw #fl', hrefFor: { mention: (m) => `/u/${m}`, tag: (t) => `/t/${t}` } }),
  );
  assert.match(html, /<a [^>]*href="https:\/\/x\.com\/joelw"/);
  assert.match(html, /rel="noopener noreferrer ugc nofollow"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /title="https:\/\/x\.com\/joelw"/);
  assert.match(html, /<br\/>/);
  assert.match(html, /<a [^>]*href="\/u\/joelw"[^>]*>@joelw<\/a>/);
  assert.match(html, /<a [^>]*href="\/t\/fl"[^>]*>#fl<\/a>/);
  const plain = renderToStaticMarkup(h(RichText, { text: '@joelw #fl' }));
  assert.doesNotMatch(plain, /<a /);
  const evil = renderToStaticMarkup(h(RichText, { text: '@joelw', hrefFor: { mention: () => 'javascript:alert(1)' } }));
  assert.doesNotMatch(evil, /javascript|href/);
  const cut = renderToStaticMarkup(h(RichText, { text: 'https://floridapolitics.com/archives/123456/long', maxUrlLength: 12 }));
  assert.match(cut, /title="https:\/\/floridapolitics\.com\/archives\/123456\/long"/);
  assert.match(cut, />floridapolitics\.com…</);
  const hostilePrefix = renderToStaticMarkup(h(RichText, { text: 'https://firstnationalbank.example.com/secure/reset/password', maxUrlLength: 12 }));
  assert.match(hostilePrefix, /<a [^>]*>firstnationalbank\.example\.com…<\/a>/);
});

test('displayDomain returns the host without www and empty for invalid input', () => {
  assert.equal(displayDomain('https://www.floridapolitics.com/a/b'), 'floridapolitics.com');
  assert.equal(displayDomain('http://x.com'), 'x.com');
  assert.equal(displayDomain('not a url'), '');
  assert.equal(displayDomain('javascript:alert(1)'), '');
  assert.equal(displayDomain(''), '');
});

const base = { url: 'https://www.floridapolitics.com/archives/1', title: 'A very long headline about Florida politics that wraps', image: { src: 'https://img.example.com/a.jpg', alt: 'Capitol', width: 1200, height: 630 }, favicon: 'https://floridapolitics.com/favicon.ico' };

test('LinkPreview large: one link, image lazy with size, domain row, clamped title', () => {
  const html = renderToStaticMarkup(h(LinkPreview, base));
  assert.equal((html.match(/<a /g) ?? []).length, 1);
  assert.match(html, /data-variant="large"/);
  assert.match(html, /<a [^>]*href="https:\/\/www\.floridapolitics\.com\/archives\/1"/);
  assert.match(html, /rel="noopener noreferrer ugc nofollow"/);
  assert.match(html, /<img [^>]*loading="lazy"/);
  assert.match(html, /<img [^>]*decoding="async"/);
  assert.match(html, /<img [^>]*width="1200"/);
  assert.match(html, /<img [^>]*height="630"/);
  assert.match(html, /alt="Capitol"/);
  assert.match(html, /cieo-link-preview-domain">floridapolitics\.com</);
  assert.match(html, /cieo-link-preview-title-text">A very long/);
  assert.ok(html.indexOf('cieo-link-preview-media') < html.indexOf('cieo-link-preview-site'));
  assert.doesNotMatch(html, /aria-busy/);
});

test('LinkPreview compact, site name, description only on large', () => {
  const compact = renderToStaticMarkup(h(LinkPreview, { ...base, variant: 'compact', siteName: 'Florida Politics', description: 'Summary' }));
  assert.match(compact, /data-variant="compact"/);
  assert.match(compact, />Florida Politics</);
  assert.match(compact, /cieo-link-preview-domain">floridapolitics\.com</);
  assert.doesNotMatch(compact, /Summary/);
  assert.match(renderToStaticMarkup(h(LinkPreview, { ...base, description: 'Summary' })), />Summary</);
});

test('LinkPreview treats user content as untrusted', () => {
  const bad = renderToStaticMarkup(h(LinkPreview, { url: 'javascript:alert(1)', title: '<img src=x onerror=alert(1)>', image: { src: 'javascript:alert(1)', alt: '' }, favicon: 'data:image/svg+xml,<svg onload=alert(1)>' }));
  assert.doesNotMatch(bad, /<a |href=|javascript|<img |data:image/);
  assert.match(bad, /&lt;img/);
  assert.doesNotMatch(bad, /cieo-link-preview-domain/);
  assert.doesNotMatch(bad, /data-linked/);
  const ok = renderToStaticMarkup(h(LinkPreview, { url: 'ftp://x.com/a', title: 't' }));
  assert.doesNotMatch(ok, /<a /);
});

test('LinkPreview loading shows a same-footprint skeleton with a status and no link', () => {
  for (const variant of ['large', 'compact']) {
    const html = renderToStaticMarkup(h(LinkPreview, { ...base, variant, loading: true }));
    assert.match(html, /data-loading=""/);
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /cieo-link-preview-skeleton/);
    assert.match(html, /cieo-link-preview-media/);
    assert.match(html, /role="status"[^>]*>Loading link preview/);
    assert.doesNotMatch(html, /<a |<img /);
  }
});

test('newItemsLabel pluralizes and clamps', () => {
  assert.equal(newItemsLabel(1), '1 new reply');
  assert.equal(newItemsLabel(3), '3 new replies');
  assert.equal(newItemsLabel(1200), '1,200 new replies');
  assert.equal(newItemsLabel(0), '0 new replies');
  assert.equal(newItemsLabel(-4), '0 new replies');
  assert.equal(newItemsLabel(Number.NaN), '0 new replies');
  assert.equal(newItemsLabel(2.9), '2 new replies');
  assert.equal(clampNewItems(Infinity), 0);
});

test('newItemsAnnouncement speaks on first appearance only', () => {
  const say = (n) => `${n} new`;
  assert.equal(newItemsAnnouncement(0, 3, say), '3 new');
  assert.equal(newItemsAnnouncement(3, 4, say), null);
  assert.equal(newItemsAnnouncement(4, 0, say), '');
  assert.equal(newItemsAnnouncement(0, 0, say), '');
  assert.equal(newItemsAnnouncement(0, 1, say), '1 new');
});

test('splitNewItemsLabel separates the rolling number from the words', () => {
  assert.deepEqual(splitNewItemsLabel('3 new replies', 3), { rolls: true, rest: ' new replies' });
  assert.deepEqual(splitNewItemsLabel('Nuevas: 3', 3), { rolls: false, rest: 'Nuevas: 3' });
});

test('NewItemsPill renders a named button only when there are items', () => {
  const none = renderToStaticMarkup(h(NewItemsPill, { count: 0, onShow() {} }));
  assert.doesNotMatch(none, /<button/);
  assert.match(none, /role="status"[^>]*aria-live="polite"/);
  const some = renderToStaticMarkup(h(NewItemsPill, { count: 3, onShow() {}, placement: 'bottom' }));
  assert.match(some, /<button [^>]*type="button"/);
  assert.match(some, /aria-label="3 new replies"/);
  assert.match(some, /data-placement="bottom"/);
  assert.match(renderToStaticMarkup(h(NewItemsPill, { count: 1, onShow() {} })), /aria-label="1 new reply"/);
  assert.match(renderToStaticMarkup(h(NewItemsPill, { count: 2, onShow() {}, label: (n) => `${n} nuevas` })), /aria-label="2 nuevas"/);
  assert.match(renderToStaticMarkup(h(NewItemsPill, { count: 2, onShow() {} })), /data-placement="top"/);
  assert.match(some, /cieo-compact-count/);
});

test('trimUrl stays linear on a long run of closing parentheses', () => {
  const input = 'https://a.com/' + ')'.repeat(50000);
  const t0 = performance.now();
  const tokens = tokenizeRichText(input);
  assert.ok(performance.now() - t0 < 100, 'tokenizing 50k parens must be fast');
  assert.equal(tokens.map((t) => t.value).join(''), input);
});

test('addresses with a name or password before the host stay plain text', () => {
  for (const text of ['https://paypal.com@evil.example/', 'https://user:pw@example.com/x']) {
    assert.equal(links(text).length, 0, text);
    assert.equal(tokenizeRichText(text).map((t) => t.value).join(''), text);
  }
  assert.equal(links('https://example.com/@me').length, 1);
});

test('email addresses never become mentions', () => {
  for (const email of ['jean-@example.com', 'a+b@x.com', "x'y@x.com", "!#$%&'*+/=?^_`{|}~-@x.com", '"q"@x.com']) {
    assert.equal(tokenizeRichText(email).filter((t) => t.type === 'mention').length, 0, email);
  }
  assert.equal(tokenizeRichText('hi @bob.').filter((t) => t.type === 'mention').length, 1);
});

test('over-long or hyphenated handles are not cut into a shorter mention', () => {
  assert.equal(tokenizeRichText('@' + 'a'.repeat(40)).filter((t) => t.type === 'mention').length, 0);
  assert.equal(tokenizeRichText('@bob-smith').filter((t) => t.type === 'mention').length, 0);
});

test('LinkPreview draws only absolute http(s) images and favicons', () => {
  const base = { url: 'https://example.com/a', title: 'T' };
  const sameOrigin = renderToStaticMarkup(h(LinkPreview, { ...base, image: { src: '/account/x', alt: '' }, favicon: '/f.ico' }));
  assert.match(sameOrigin, /<img [^>]*src="\/account\/x"/);
  assert.match(sameOrigin, /<img [^>]*src="\/f\.ico"/);
  assert.match(sameOrigin, /referrerPolicy="no-referrer"/);
  const abs = renderToStaticMarkup(h(LinkPreview, { ...base, image: { src: 'https://example.com/i.png', alt: '' }, favicon: 'https://example.com/f.ico' }));
  assert.equal((abs.match(/<img/g) || []).length, 2);
  assert.equal((abs.match(/referrerPolicy="no-referrer"/g) || []).length, 2);
  const invalid = renderToStaticMarkup(h(LinkPreview, { ...base, image: { src: 'data:image/png;base64,AA==', alt: '' }, favicon: 'javascript:alert(1)' }));
  assert.doesNotMatch(invalid, /<img/);
});

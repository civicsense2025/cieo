// test/primitives-audio-playback.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AudioPlayButton, audioPlayButtonName } from '../dist/primitives/AudioPlayButton/AudioPlayButton.js';
import { AudioWaveform, waveformBars, seekFromPointer, waveformKeyStep, WAVEFORM_FLOOR } from '../dist/primitives/AudioWaveform/AudioWaveform.js';
import { PlaybackRateButton, nextRate, playbackRateName } from '../dist/primitives/PlaybackRateButton/PlaybackRateButton.js';
import { AudioPlayer, audioPlayerStep, registerAudioPlayer, claimAudioPlayback, AUDIO_PLAY_EVENT } from '../dist/primitives/AudioPlayer/AudioPlayer.js';
import { AudioTranscript, activeWordIndex, transcriptKeyStep, shouldAutoScroll, transcriptScrollTop } from '../dist/primitives/AudioTranscript/AudioTranscript.js';

const html = (c, p) => renderToStaticMarkup(h(c, p));

// AudioPlayButton
test('AudioPlayButton names the action after the clip and flips with state', () => {
  assert.equal(audioPlayButtonName(false, 'Note'), 'Play Note');
  assert.equal(audioPlayButtonName(true, 'Note'), 'Pause Note');
  const idle = html(AudioPlayButton, { playing: false, label: 'Note', onToggle() {} });
  assert.match(idle, /<button(?=[^>]*type="button")(?=[^>]*aria-label="Play Note")/);
  assert.doesNotMatch(idle, /data-playing|aria-busy/);
  const on = html(AudioPlayButton, { playing: true, label: 'Note', onToggle() {}, size: 'lg' });
  assert.match(on, /aria-label="Pause Note"/);
  assert.match(on, /data-playing=""/);
  assert.match(on, /data-size="lg"/);
});
test('AudioPlayButton loading is busy and keeps both morph halves in the markup', () => {
  const m = html(AudioPlayButton, { playing: false, loading: true, label: 'Note', onToggle() {} });
  assert.match(m, /aria-busy="true"/);
  assert.match(m, /data-loading=""/);
  assert.equal((m.match(/cieo-audio-play-button-half/g) ?? []).length, 2);
});

// waveform math
test('waveformBars buckets by max, normalizes to 1 and never drops below the floor', () => {
  assert.deepEqual(waveformBars([0.1, 0.5, 0.2, 1], 2), [0.5, 1]);
  const bars = waveformBars([0, 0.2, 0.4], 3);
  assert.equal(bars[2], 1);
  assert.equal(bars[0], WAVEFORM_FLOOR);
  assert.ok(bars.every((b) => b >= WAVEFORM_FLOOR && b <= 1));
});
test('waveformBars edges: empty, silent, fewer peaks than bars, bad values, zero count', () => {
  assert.deepEqual(waveformBars([], 4), [0.08, 0.08, 0.08, 0.08]);
  assert.deepEqual(waveformBars([0, 0], 3), [0.08, 0.08, 0.08]);
  assert.equal(waveformBars([0.3, 0.9], 6).length, 6);
  assert.ok(waveformBars([Number.NaN, 1, -1], 3).every((b) => Number.isFinite(b) && b > 0));
  assert.deepEqual(waveformBars([1], 0), []);
});
test('seekFromPointer maps x to seconds and clamps', () => {
  assert.equal(seekFromPointer(50, 100, 60), 30);
  assert.equal(seekFromPointer(-20, 100, 60), 0);
  assert.equal(seekFromPointer(500, 100, 60), 60);
  assert.equal(seekFromPointer(10, 0, 60), 0);
  assert.equal(seekFromPointer(10, 100, Number.NaN), 0);
  assert.equal(seekFromPointer(10, 100, 0), 0);
});
test('waveformKeyStep map: arrows 5s, pages 10 percent, ends, clamped, others null', () => {
  assert.equal(waveformKeyStep('ArrowRight', 10, 63), 15);
  assert.equal(waveformKeyStep('ArrowUp', 10, 63), 15);
  assert.equal(waveformKeyStep('ArrowLeft', 10, 63), 5);
  assert.equal(waveformKeyStep('ArrowDown', 2, 63), 0);
  assert.equal(waveformKeyStep('ArrowRight', 61, 63), 63);
  assert.equal(waveformKeyStep('PageUp', 10, 100), 20);
  assert.equal(waveformKeyStep('PageDown', 5, 100), 0);
  assert.equal(waveformKeyStep('Home', 40, 100), 0);
  assert.equal(waveformKeyStep('End', 40, 100), 100);
  assert.equal(waveformKeyStep('a', 40, 100), null);
  assert.equal(waveformKeyStep(' ', 40, 100), null);
});
test('AudioWaveform is a labelled image without onSeek and a slider with it', () => {
  const peaks = [0.1, 0.8, 0.4];
  const ro = html(AudioWaveform, { peaks, duration: 63, current: 12, label: 'Note', bars: 8 });
  assert.match(ro, /role="img"/);
  assert.match(ro, /aria-label="Note"/);
  assert.doesNotMatch(ro, /tabindex|aria-valuenow/);
  const rw = html(AudioWaveform, { peaks, duration: 63, current: 12, onSeek() {}, label: 'Seek in Note', bars: 8 });
  assert.match(rw, /role="slider"/);
  assert.match(rw, /tabindex="0"/);
  assert.match(rw, /aria-valuemin="0"/);
  assert.match(rw, /aria-valuemax="63"/);
  assert.match(rw, /aria-valuenow="12"/);
  assert.match(rw, /aria-valuetext="12 seconds of 1 minute 3 seconds"/);
});
test('AudioWaveform draws the requested bars twice (base and continuously clipped played copy) and exposes progress', () => {
  const m = html(AudioWaveform, { peaks: [1, 0.5], duration: 10, current: 5, label: 'x', bars: 12 });
  assert.equal((m.match(/cieo-audio-waveform-bar"/g) ?? []).length, 24);
  assert.match(m, /cieo-audio-waveform-played/);
  assert.match(m, /--progress:0\.5/);
  assert.equal((html(AudioWaveform, { peaks: [], duration: 10, current: 0, label: 'x' }).match(/cieo-audio-waveform-bar"/g) ?? []).length, 96);
  assert.match(html(AudioWaveform, { peaks: [], duration: 0, current: 5, label: 'x' }), /--progress:0[;"]/);
});

// PlaybackRateButton
test('nextRate cycles, wraps, starts over on unknown, tolerates empty', () => {
  assert.equal(nextRate([1, 1.5, 2], 1), 1.5);
  assert.equal(nextRate([1, 1.5, 2], 2), 1);
  assert.equal(nextRate([1, 1.5, 2], 0.75), 1);
  assert.equal(nextRate([], 1.5), 1.5);
});
test('PlaybackRateButton shows the rate and names it in words', () => {
  const m = html(PlaybackRateButton, { rate: 1.5, onRateChange() {} });
  assert.match(m, /aria-label="Playback speed, 1\.5 times"/);
  assert.match(m, />1\.5×</);
  assert.equal(playbackRateName(2), 'Playback speed, 2 times');
});

// AudioPlayer state machine
test('audioPlayerStep: every transition', () => {
  assert.equal(audioPlayerStep('loading', 'loadedmetadata'), 'ready');
  assert.equal(audioPlayerStep('loading', 'play'), 'playing');
  assert.equal(audioPlayerStep('loading', 'error'), 'error');
  assert.equal(audioPlayerStep('ready', 'play'), 'playing');
  assert.equal(audioPlayerStep('ready', 'loadedmetadata'), 'ready');
  assert.equal(audioPlayerStep('playing', 'pause'), 'ready');
  assert.equal(audioPlayerStep('playing', 'loadedmetadata'), 'playing');
  assert.equal(audioPlayerStep('playing', 'ended'), 'ended');
  assert.equal(audioPlayerStep('playing', 'error'), 'error');
  assert.equal(audioPlayerStep('ended', 'play'), 'playing');
  assert.equal(audioPlayerStep('ended', 'pause'), 'ended');
  assert.equal(audioPlayerStep('ready', 'pause'), 'ready');
});
test('audioPlayerStep: pause then ended (browser order) lands on ended; error is sticky until retry; retry only from error', () => {
  assert.equal(audioPlayerStep(audioPlayerStep('playing', 'pause'), 'ended'), 'ended');
  for (const ev of ['loadedmetadata', 'play', 'pause', 'ended']) assert.equal(audioPlayerStep('error', ev), 'error');
  assert.equal(audioPlayerStep('error', 'retry'), 'loading');
  assert.equal(audioPlayerStep('playing', 'retry'), 'playing');
  assert.equal(audioPlayerStep(audioPlayerStep('error', 'retry'), 'loadedmetadata'), 'ready');
});

// one-at-a-time registry
test('starting one player pauses the others and announces on the document event', () => {
  const doc = new EventTarget();
  const paused = [];
  const offA = registerAudioPlayer('a', () => paused.push('a'), doc);
  const offB = registerAudioPlayer('b', () => paused.push('b'), doc);
  const seen = [];
  doc.addEventListener(AUDIO_PLAY_EVENT, (e) => seen.push(e.detail.id));
  claimAudioPlayback('a', doc);
  assert.ok(paused.includes('b'));
  assert.ok(!paused.includes('a'));
  assert.deepEqual(seen, ['a']);
  offA();
  offB();
  paused.length = 0;
  claimAudioPlayback('b', doc);
  assert.deepEqual(paused, []);
});
test('a separately bundled copy is paused through the event alone', () => {
  const doc = new EventTarget();
  let paused = 0;
  registerAudioPlayer('copy', () => paused++, doc);
  doc.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id: 'other-bundle' } }));
  assert.equal(paused, 1);
  doc.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id: 'copy' } }));
  assert.equal(paused, 1);
});

// AudioPlayer SSR
test('AudioPlayer compact with peaks: one metadata-preloading audio, play button, waveform slider, total time', () => {
  const m = html(AudioPlayer, { src: '/n.m4a', label: 'Voice note', peaks: [0.2, 0.9], duration: 63 });
  assert.equal((m.match(/<audio/g) ?? []).length, 1);
  assert.match(m, /<audio(?=[^>]*preload="metadata")(?=[^>]*src="\/n\.m4a")/);
  assert.match(m, /role="group"(?=[^>]*aria-label="Voice note")|aria-label="Voice note"(?=[^>]*role="group")/);
  assert.match(m, /data-variant="compact"/);
  assert.match(m, /data-state="loading"/);
  assert.match(m, /aria-label="Play Voice note"/);
  assert.match(m, /aria-busy="true"/);
  assert.match(m, /role="slider"/);
  assert.match(m, /1 minute 3 seconds/);
  assert.doesNotMatch(m, /Playback speed/);
});
test('AudioPlayer without peaks draws a thin slider track; full adds speed and both clocks', () => {
  const m = html(AudioPlayer, { src: '/n.m4a', label: 'Memo', duration: 63, variant: 'full' });
  assert.match(m, /cieo-audio-player-track/);
  assert.match(m, /role="slider"(?=[^>]*aria-valuemax="63")/);
  assert.match(m, /aria-label="Playback speed, 1 time"/);
  assert.match(m, /data-variant="full"/);
  assert.match(m, /-1:03/);
  assert.match(m, /data-size="lg"/);
});
test('AudioPlayer first render never touches window or document', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  assert.doesNotThrow(() => html(AudioPlayer, { src: '/x.mp3', label: 'x' }));
});

// AudioTranscript
const W = [{ text: 'Hello', start: 1, end: 1.5 }, { text: 'there,', start: 1.6, end: 2 }, { text: 'friend.', start: 3, end: 3.6 }];
test('activeWordIndex: before first is -1, gaps keep previous, boundaries and end', () => {
  assert.equal(activeWordIndex(W, 0), -1);
  assert.equal(activeWordIndex(W, 0.99), -1);
  assert.equal(activeWordIndex(W, 1), 0);
  assert.equal(activeWordIndex(W, 1.55), 0);
  assert.equal(activeWordIndex(W, 1.6), 1);
  assert.equal(activeWordIndex(W, 2.5), 1);
  assert.equal(activeWordIndex(W, 3), 2);
  assert.equal(activeWordIndex(W, 99), 2);
  assert.equal(activeWordIndex([], 5), -1);
  assert.equal(activeWordIndex(W, Number.NaN), -1);
});
test('activeWordIndex scales: binary search over a long transcript', () => {
  const long = Array.from({ length: 5000 }, (_, i) => ({ start: i, end: i + 0.9 }));
  assert.equal(activeWordIndex(long, 2500.4), 2500);
  assert.equal(activeWordIndex(long, 4999.99), 4999);
});
test('transcriptKeyStep moves the focus marker and clamps', () => {
  assert.equal(transcriptKeyStep('ArrowRight', 0, 3), 1);
  assert.equal(transcriptKeyStep('ArrowRight', 2, 3), 2);
  assert.equal(transcriptKeyStep('ArrowLeft', 0, 3), 0);
  assert.equal(transcriptKeyStep('ArrowLeft', 2, 3), 1);
  assert.equal(transcriptKeyStep('Home', 2, 3), 0);
  assert.equal(transcriptKeyStep('End', 0, 3), 2);
  assert.equal(transcriptKeyStep('x', 0, 3), null);
  assert.equal(transcriptKeyStep('ArrowRight', 0, 0), null);
});
test('auto-scroll yields to the reader for 4 seconds and only scrolls when the word is out of view', () => {
  assert.equal(shouldAutoScroll(10000, null), true);
  assert.equal(shouldAutoScroll(10000, 7000), false);
  assert.equal(shouldAutoScroll(10000, 6000), true);
  assert.equal(transcriptScrollTop(100, 20, 200, 0), null);
  assert.equal(transcriptScrollTop(500, 20, 200, 0), 410);
  assert.equal(transcriptScrollTop(10, 20, 200, 300), 0);
});
test('AudioTranscript read-only marks the active word; seekable is one tab stop with activedescendant and options', () => {
  const ro = html(AudioTranscript, { words: W, current: 1.7, label: 'Transcript' });
  assert.match(ro, /role="group"/);
  assert.equal((ro.match(/data-active=""/g) ?? []).length, 1);
  assert.match(ro, /data-active=""[^>]*>there,</);
  assert.doesNotMatch(ro, /role="option"|tabindex/);
  const rw = html(AudioTranscript, { words: W, current: 1.7, onSeek() {}, label: 'Transcript' });
  assert.match(rw, /role="listbox"/);
  assert.equal((rw.match(/tabindex="0"/g) ?? []).length, 1);
  assert.match(rw, /aria-activedescendant="[^"]+-w1"/);
  assert.equal((rw.match(/role="option"/g) ?? []).length, 3);
  assert.match(rw, /aria-selected="true"[^>]*>there,</);
  assert.doesNotMatch(html(AudioTranscript, { words: W, current: 0, label: 'T' }), /data-active/);
});

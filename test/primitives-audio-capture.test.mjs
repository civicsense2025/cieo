// test/primitives-audio-capture.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { rmsLevel, levelBars, AudioLevelMeter } from '../dist/primitives/AudioLevelMeter/AudioLevelMeter.js';
import { voiceRecorderStep, recorderIdle, shouldEmitClip, isRecorderActive, pickRecorderMimeType, downsamplePeaks, holdGesture, isNearLimit, remainingSeconds, recorderAnnouncement, limitRemainingMs, clipDuration, recorderAfterCleanup, VoiceRecorder } from '../dist/primitives/VoiceRecorder/VoiceRecorder.js';
import { speakingStep, speakerLabel, SpeakerTile } from '../dist/primitives/SpeakerTile/SpeakerTile.js';
import { AudioRoom, stageKey } from '../dist/primitives/AudioRoom/AudioRoom.js';

const run = (events, from = recorderIdle) => events.reduce((s, e) => voiceRecorderStep(s, typeof e === 'string' ? { type: e } : e), from);

test('rmsLevel maps loudness to 0..1 on a dB scale', () => {
  assert.equal(rmsLevel([]), 0);
  assert.equal(rmsLevel([0, 0, 0]), 0);
  assert.equal(rmsLevel([1, -1, 1, -1]), 1);
  assert.equal(rmsLevel([5, -5]), 1, 'clamps above 0 dB');
  assert.ok(Math.abs(rmsLevel([0.001, -0.001]) - 0) < 1e-9, '-60 dB is silence');
  assert.ok(Math.abs(rmsLevel([0.1, -0.1]) - 2 / 3) < 1e-9, '-20 dB is two thirds');
  assert.equal(rmsLevel([0.0001]), 0, 'below the floor clamps to 0');
  assert.ok(rmsLevel([NaN, 0.5]) > 0 && Number.isFinite(rmsLevel([NaN, 0.5])), 'NaN samples do not poison the result');
  assert.ok(rmsLevel(new Float32Array([0.5, -0.5])) > rmsLevel(new Float32Array([0.05, -0.05])), 'louder is higher');
});

test('levelBars: center taller, bounded, safe on junk', () => {
  const b = levelBars(1, 5);
  assert.equal(b.length, 5);
  assert.equal(b[2], 1);
  assert.ok(b[2] > b[1] && b[1] > b[0]);
  assert.equal(b[0], b[4], 'symmetric');
  for (const v of levelBars(0, 5)) assert.equal(v, 0.1, 'silence keeps a stub');
  assert.ok(levelBars(2, 7).every((v) => v >= 0.1 && v <= 1), 'level clamps');
  assert.ok(levelBars(NaN, 3).every((v) => v === 0.1));
  assert.deepEqual(levelBars(0.5, 0), []);
  assert.equal(levelBars(1, 1)[0], 1);
});

test('AudioLevelMeter renders a labelled img with hidden bars and no valuenow', () => {
  const html = renderToStaticMarkup(h(AudioLevelMeter, { level: 0.5 }));
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Microphone level"/);
  assert.equal((html.match(/cieo-audio-level-meter-bar/g) ?? []).length, 5);
  assert.doesNotMatch(html, /aria-valuenow/);
  assert.match(renderToStaticMarkup(h(AudioLevelMeter, { bars: 3, label: 'Mic' })), /aria-label="Mic"/);
  assert.equal((renderToStaticMarkup(h(AudioLevelMeter, { bars: 3 })).match(/cieo-audio-level-meter-bar/g) ?? []).length, 3);
});

test('voiceRecorderStep: happy path with pause and stop', () => {
  assert.equal(run(['start']).phase, 'requesting');
  assert.equal(run(['start', 'granted']).phase, 'recording');
  assert.equal(run(['start', 'granted', 'pause']).phase, 'paused');
  assert.equal(run(['start', 'granted', 'pause', 'resume']).phase, 'recording');
  assert.equal(run(['start', 'granted', 'stop']).phase, 'done');
  assert.equal(run(['start', 'granted', 'pause', 'stop']).phase, 'done');
  assert.equal(run(['start', 'granted', 'limit']).phase, 'done');
  assert.equal(run(['start', 'granted', { type: 'tick', elapsed: 12.9 }]).elapsed, 12);
  assert.equal(run(['start', 'granted', 'pause', { type: 'tick', elapsed: 5 }]).elapsed, 0, 'no ticks while paused');
  assert.equal(run(['start', 'granted', { type: 'tick', elapsed: NaN }]).elapsed, 0);
});

test('voiceRecorderStep: errors carry a reason and recover', () => {
  assert.deepEqual(run(['start', 'denied']), { phase: 'error', elapsed: 0, reason: 'denied' });
  assert.equal(run(['unsupported']).reason, 'unsupported');
  assert.equal(run(['start', 'unsupported']).reason, 'unsupported');
  assert.equal(run(['start', 'granted', 'fail']).reason, 'failed');
  assert.equal(run(['start', 'granted', 'pause', 'fail']).phase, 'error');
  assert.equal(run(['fail']).phase, 'idle', 'fail when nothing is active is ignored');
  assert.equal(run(['start', 'denied', 'start']).phase, 'requesting', 'try again');
  assert.equal(run(['start', 'denied', 'reset']).phase, 'idle');
  assert.equal(run(['start', 'denied', 'start']).reason, null);
});

test('voiceRecorderStep: cancel from every active state returns to idle and never reaches done', () => {
  for (const path of [['start'], ['start', 'granted'], ['start', 'granted', 'pause'], ['start', 'granted', { type: 'tick', elapsed: 9 }]]) {
    const before = run(path);
    const after = run(['cancel'], before);
    assert.deepEqual(after, recorderIdle);
    assert.equal(shouldEmitClip(before, after), false, 'cancel never emits a clip');
  }
});

test('voiceRecorderStep: invalid events are ignored', () => {
  assert.equal(run(['stop']).phase, 'idle');
  assert.equal(run(['pause']).phase, 'idle');
  assert.equal(run(['granted']).phase, 'idle');
  assert.equal(run(['start', 'pause']).phase, 'requesting');
  assert.equal(run(['start', 'start']).phase, 'requesting');
  assert.equal(run(['start', 'stop']).phase, 'requesting', 'cannot stop before the mic is live');
  assert.equal(run(['start', 'granted', 'start']).phase, 'recording', 'cannot restart mid-take');
  assert.equal(run(['start', 'granted', 'stop', 'stop']).phase, 'done');
});

test('shouldEmitClip only on the step that finishes a take', () => {
  const rec = run(['start', 'granted']);
  assert.equal(shouldEmitClip(rec, run(['stop'], rec)), true);
  assert.equal(shouldEmitClip(rec, run(['limit'], rec)), true);
  assert.equal(shouldEmitClip(rec, run(['fail'], rec)), false);
  const done = run(['stop'], rec);
  assert.equal(shouldEmitClip(done, run(['stop'], done)), false, 'a finished take cannot emit twice');
  assert.equal(isRecorderActive('requesting') && isRecorderActive('paused') && !isRecorderActive('done') && !isRecorderActive('error'), true);
});

test('pickRecorderMimeType follows the preference order', () => {
  assert.equal(pickRecorderMimeType(() => true), 'audio/webm;codecs=opus');
  assert.equal(pickRecorderMimeType((t) => t === 'audio/mp4'), 'audio/mp4');
  assert.equal(pickRecorderMimeType((t) => t === 'audio/ogg;codecs=opus'), 'audio/ogg;codecs=opus');
  assert.equal(pickRecorderMimeType((t) => t.startsWith('audio/mp4') || t.startsWith('audio/ogg')), 'audio/mp4');
  assert.equal(pickRecorderMimeType(() => false), '');
  assert.equal(pickRecorderMimeType(() => { throw new Error('boom'); }), '');
});

test('downsamplePeaks keeps the loudest reading per slice', () => {
  assert.deepEqual(downsamplePeaks([]), []);
  assert.equal(downsamplePeaks([0.5]).length, 64);
  const many = Array.from({ length: 1000 }, (_, i) => (i === 500 ? 0.9 : 0.1));
  const out = downsamplePeaks(many, 10);
  assert.equal(out.length, 10);
  assert.equal(out[5], 0.9);
  assert.equal(out[0], 0.1);
  assert.deepEqual(downsamplePeaks([0.2, 0.4, 0.6, 0.8], 2), [0.4, 0.8]);
  assert.deepEqual(downsamplePeaks([1, 2, NaN, -0.5], 4), [1, 1, 0, 0.5], 'clamps and cleans junk');
  assert.deepEqual(downsamplePeaks([0.5], 0), []);
  assert.equal(downsamplePeaks([0.3, 0.3], 64).length, 64, 'short clips still fill the waveform');
});

test('holdGesture cancels only past 80px to the left', () => {
  assert.equal(holdGesture(0), 'record');
  assert.equal(holdGesture(40), 'record');
  assert.equal(holdGesture(-80), 'record');
  assert.equal(holdGesture(-81), 'cancel');
  assert.equal(holdGesture(-300), 'cancel');
  assert.equal(holdGesture(NaN), 'record');
});

test('limit warning window and announcements', () => {
  assert.equal(isNearLimit(109, 120), false);
  assert.equal(isNearLimit(110, 120), true);
  assert.equal(isNearLimit(119.5, 120), true);
  assert.equal(isNearLimit(5, 8), false, 'short limits do not warn');
  assert.equal(remainingSeconds(115.2, 120), 5);
  assert.equal(remainingSeconds(130, 120), 0);
  assert.equal(recorderAnnouncement('recording'), 'Recording');
  assert.equal(recorderAnnouncement('paused'), 'Paused');
  assert.equal(recorderAnnouncement('stopped', 12), 'Recording stopped, 12 seconds');
  assert.equal(recorderAnnouncement('stopped', 1), 'Recording stopped, 1 second');
  assert.equal(recorderAnnouncement('denied'), 'Microphone access is blocked. Allow it in your browser settings.');
});

test('VoiceRecorder idle markup: labelled group, mic button, polite status, no clock', () => {
  const html = renderToStaticMarkup(h(VoiceRecorder, { onRecorded() {} }));
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Record a voice reply"/);
  assert.match(html, /<button[^>]*class="cieo-voice-recorder-mic"/);
  assert.match(html, /role="status"[^>]*aria-live="polite"|aria-live="polite"[^>]*role="status"/);
  assert.match(html, /data-phase="idle"/);
  assert.doesNotMatch(html, /Cancel recording|cieo-audio-time/, 'no recording controls while idle');
  assert.match(renderToStaticMarkup(h(VoiceRecorder, { onRecorded() {}, label: 'Reply by voice', mode: 'hold' })), /data-mode="hold"[\s\S]*aria-label="Reply by voice"|aria-label="Reply by voice"[\s\S]*data-mode="hold"/);
});

test('speakingStep has hysteresis', () => {
  assert.equal(speakingStep(false, 0.12), false);
  assert.equal(speakingStep(false, 0.13), true);
  assert.equal(speakingStep(false, 0.09), false);
  assert.equal(speakingStep(true, 0.09), true, 'stays on between thresholds');
  assert.equal(speakingStep(true, 0.06), true);
  assert.equal(speakingStep(true, 0.05), false);
  assert.equal(speakingStep(true, NaN), false);
  assert.equal(speakingStep(false, 5), true);
});

test('speakerLabel reads role, mute, speaking and hand', () => {
  assert.equal(speakerLabel({ name: 'Ava', role: 'host', speaking: true }), 'Ava, host, speaking');
  assert.equal(speakerLabel({ name: 'Ben', muted: true, handRaised: true }), 'Ben, muted, hand raised');
  assert.equal(speakerLabel({ name: 'Cy', muted: true, speaking: true }), 'Cy, muted', 'muted is never speaking');
  assert.equal(speakerLabel({ name: 'Di' }), 'Di');
});

test('SpeakerTile markup: accessible text, badges, speaking flag', () => {
  const av = h('span', null, 'A');
  const loud = renderToStaticMarkup(h(SpeakerTile, { name: 'Ava', avatar: av, role: 'host', level: 0.6 }));
  assert.match(loud, /cieo-sr-only">Ava, host, speaking</);
  assert.match(loud, /data-speaking/);
  assert.match(loud, /data-role="host"/);
  assert.doesNotMatch(loud, /data-badge/);
  const quiet = renderToStaticMarkup(h(SpeakerTile, { name: 'Ben', avatar: av, muted: true, handRaised: true, level: 0.9 }));
  assert.match(quiet, /cieo-sr-only">Ben, muted, hand raised</);
  assert.doesNotMatch(quiet, /data-speaking/, 'muted tiles never show speaking');
  assert.match(quiet, /data-badge="muted"/);
  assert.match(quiet, /data-badge="hand"/);
  assert.match(quiet, /aria-hidden="true"[^>]*>Ben</, 'visible name is hidden from AT so it is not read twice');
  assert.match(renderToStaticMarkup(h(SpeakerTile, { name: 'X', avatar: av, size: 'sm' })), /data-size="sm"/);
});

const speakers = [
  { id: 'a', name: 'Ava', avatar: h('span', null, 'A'), role: 'host', level: 0.5 },
  { id: 'b', name: 'Ben', avatar: h('span', null, 'B'), muted: true, handRaised: true },
];
const room = (self, extra = {}) => renderToStaticMarkup(h(AudioRoom, { title: 'Friday jam', speakers, listenerCount: 1240, self, onToggleMute() {}, onToggleHand() {}, onLeave() {}, ...extra }));

test('AudioRoom: labelled region, stage, count, controls', () => {
  const html = room({ muted: false, handRaised: false, canSpeak: true });
  assert.match(html, /<section[^>]*aria-labelledby="([^"]+)"/);
  const id = html.match(/aria-labelledby="([^"]+)"/)[1];
  assert.match(html, new RegExp(`<h2 id="${id.replace(/[:]/g, '\\$&')}"[^>]*>Friday jam<`));
  assert.match(html, /aria-label="Speakers"/);
  assert.equal((html.match(/cieo-audio-room-seat/g) ?? []).length, 2);
  assert.match(html, />1\.2K</);
  assert.match(html, /1,240 listening/);
  assert.match(html, /aria-pressed="false"[^>]*>[\s\S]*?<span>Mute</);
  assert.match(html, /Raise hand/);
  assert.match(html, /data-tone="danger"[^>]*>[\s\S]*?Leave/);
});

test('AudioRoom: pressed states mirror self, listeners cannot mute, reactions slot renders', () => {
  const html = room({ muted: true, handRaised: true, canSpeak: true });
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
  const listener = room({ muted: true, handRaised: false, canSpeak: false }, { reactions: h('button', { id: 'react' }, '+') });
  assert.doesNotMatch(listener, /<span>Mute</);
  assert.match(listener, /Raise hand/);
  assert.match(listener, /id="react"/);
  assert.match(room({ muted: false, handRaised: false, canSpeak: false }, { listeners: h('i', { id: 'faces' }) }), /id="faces"/);
});

test('stageKey changes when people join, leave or reorder', () => {
  assert.notEqual(stageKey([{ id: 'a' }, { id: 'b' }]), stageKey([{ id: 'b' }, { id: 'a' }]));
  assert.notEqual(stageKey([{ id: 'a' }]), stageKey([{ id: 'a' }, { id: 'b' }]));
  assert.equal(stageKey([{ id: 'a' }, { id: 'b' }]), stageKey([{ id: 'a' }, { id: 'b' }]));
  assert.notEqual(stageKey([{ id: 'ab' }, { id: 'c' }]), stageKey([{ id: 'a' }, { id: 'bc' }]));
});

test('a cleaned-up recorder can start again (StrictMode remount must not wait forever)', () => {
  for (const phase of ['requesting', 'recording', 'paused']) {
    const stuck = { phase, elapsed: 3, reason: null };
    assert.equal(voiceRecorderStep(stuck, { type: 'start' }).phase, phase, 'a live state ignores start');
    const after = recorderAfterCleanup(stuck);
    assert.equal(after.phase, 'idle');
    assert.equal(voiceRecorderStep(after, { type: 'start' }).phase, 'requesting');
  }
});

test('limit timer is armed for the time left and the clip reports real length', () => {
  assert.equal(limitRemainingMs(0, 120), 120000);
  assert.equal(limitRemainingMs(30500, 120), 89500);
  assert.equal(limitRemainingMs(999999, 120), 0);
  assert.equal(limitRemainingMs(NaN, 10), 10000);
  assert.equal(clipDuration(120349), 120.3, 'not clamped to the limit');
  assert.equal(clipDuration(125000), 125);
  assert.equal(clipDuration(-5), 0);
  assert.equal(clipDuration(NaN), 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const recorderModule = process.env.CIEO_RECORDER_VISUAL_MODULE
  ? pathToFileURL(resolve(process.env.CIEO_RECORDER_VISUAL_MODULE)).href
  : new URL('../dist/primitives/VoiceRecorder/recorderVisual.js', import.meta.url).href;
const recorder = await import(recorderModule);

test('recorder live history keeps exactly 24 samples and the newest bounded levels', () => {
  assert.equal(typeof recorder.createRecorderLiveHistory, 'function');
  assert.equal(typeof recorder.pushRecorderLiveLevel, 'function');
  assert.equal(recorder.RECORDER_LIVE_BAR_COUNT, 24);

  const history = recorder.createRecorderLiveHistory();
  assert.equal(history.length, 24);
  assert.ok(history.every((level) => level === 0));

  for (let i = 1; i <= recorder.RECORDER_LIVE_BAR_COUNT + 2; i += 1) {
    recorder.pushRecorderLiveLevel(history, i / 10);
  }
  assert.equal(history.length, recorder.RECORDER_LIVE_BAR_COUNT);
  assert.equal(history[0], 0.3);
  assert.equal(history.at(-1), 1);

  recorder.pushRecorderLiveLevel(history, Number.NaN);
  assert.equal(history.at(-1), 0);
});

test('recorder bar presentation keeps a visible silent stub and finite final geometry', () => {
  assert.equal(typeof recorder.recorderLiveBarPresentation, 'function');
  assert.deepEqual(recorder.recorderLiveBarPresentation(0), { scale: 0.1, opacity: 0.45 });
  assert.deepEqual(recorder.recorderLiveBarPresentation(0.5), { scale: 0.55, opacity: 0.725 });
  assert.deepEqual(recorder.recorderLiveBarPresentation(1), { scale: 1, opacity: 1 });
  assert.deepEqual(recorder.recorderLiveBarPresentation(Number.NaN), { scale: 0.1, opacity: 0.45 });
});

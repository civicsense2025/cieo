# VoiceRecorder

Records a voice clip from the microphone and gives the host a blob, its length and 64 waveform peaks. The host owns upload and storage.

## Use when

- Voice replies in comments or messages.
- Short audio notes with a time limit.

## Avoid when

- Long recordings or meetings; there is no chunked upload.
- Video; this records audio only.

## Anatomy

Idle: a microphone button. Recording: a pulsing dot, the elapsed time, a live level meter, and Cancel, Pause and Stop buttons. A polite status line announces discrete events.

## Behavior

- `voiceRecorderStep` is a pure machine: idle, requesting, recording, paused, done, and error with reason `denied`, `unsupported` or `failed`. Cancel from any active state returns to idle and cannot produce a clip.
- The format is picked by `pickRecorderMimeType`: webm/opus, then mp4, then ogg/opus, then the browser default.
- Peaks are sampled from an analyser every 50ms and shrunk to 64 values by `downsamplePeaks`.
- The last 10 seconds before `maxDuration` show the time left in the warning color. The take stops itself at the limit. Limits of 10 seconds or less do not warn.
- Hold mode: pointer down starts, release finishes, sliding left past 80px shows "Release to cancel" and cancels (`holdGesture`).
- Every media track and the audio context are released on stop, cancel, error and unmount. Unmounting never emits a clip.

## Keyboard / accessibility

Real buttons with labels. Escape cancels. Keyboard users in hold mode get tap behavior (Enter or Space starts and stops). The status line announces "Recording", "Paused", "Recording stopped, 12 seconds" and the blocked-microphone message, never the running clock.

## Do / don't

- Do: upload in `onRecorded` and show the clip with an AudioPlayer using the same peaks.
- Don't: keep it mounted while hidden; the microphone stays held until unmount or stop.

## Customization

Colors and sizes come from tokens. `label` renames the group and start button. `maxDuration` defaults to 120 seconds.

## Limitations

- Needs MediaRecorder and getUserMedia, and a secure context.
- Safari records mp4/aac, so the host must accept more than webm.
- Pausing is not offered in hold mode.

## Related

AudioLevelMeter, AudioTime, AudioPlayer.

## Evidence

`test/primitives-audio-capture.test.mjs`.

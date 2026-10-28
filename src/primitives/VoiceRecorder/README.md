# VoiceRecorder

Records a voice clip from the microphone and gives the host a blob, its length and 64 waveform peaks by default (up to 128 when requested). The host owns upload and storage.

## Use when

- Voice replies in comments or messages.
- Short audio notes with a time limit.

## Avoid when

- Long recordings or meetings; there is no chunked upload.
- Video; this records audio only.

## Anatomy

Idle: a microphone button. Recording: a pulsing dot, the elapsed time, a bounded rolling live waveform, and Cancel, Pause and Stop buttons. A polite status line announces discrete events.

## Behavior

- `voiceRecorderStep` is a pure machine: idle, requesting, recording, paused, done, and error with reason `denied`, `unsupported` or `failed`. Cancel from any active state returns to idle and cannot produce a clip.
- The format is picked by `pickRecorderMimeType`: webm/opus, then mp4, then ogg/opus, then the browser default.
- Peaks are sampled from one analyser every 50ms. The newest 24 readings move through a rolling live waveform with direct transform and opacity writes, smoothed by short interruptible compositor transitions, without a second analyser, timer or React render. Finished clips are shrunk to 64 values by default (maximum 128) by `downsamplePeaks`.
- The live panel uses one interruptible presence spring. Its bars enter once in under 300ms, remain in place while paused, and leave with the panel after Stop or Cancel. Reduced motion and `data-motion="off"` skip the entrance and presence travel while retaining the final state and microphone feedback.
- The last 10 seconds before `maxDuration` show the time left in the warning color. The take stops itself at the limit, by a timer armed for the time left at start and resume (so a throttled background tab still stops on time); the reported duration is the real recorded length, not clamped. Limits of 10 seconds or less do not warn.
- Hold mode: pointer down starts, release finishes, sliding left past 80px shows "Release to cancel" and cancels (`holdGesture`).
- Every media track and the audio context are released on stop, cancel, error and unmount. Unmounting never emits a clip and returns the recorder to idle, so a StrictMode remount starts cleanly. An encoder error (`MediaRecorder` `onerror`) fails the take and releases everything; a failure while starting also closes the audio context.

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

`test/primitives-audio-capture.test.mjs`, `test/voice-recorder-motion.test.mjs`, and the recorder checks in `test/browser/social.py`.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `mic`, `live`, `hint`, `time`, `waveform`, `actions`, `error`, `retry`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

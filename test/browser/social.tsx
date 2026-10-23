import React, { useState, type ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { CountButton } from '../../src/primitives/CountButton/CountButton';
import { ActionBar } from '../../src/primitives/ActionBar/ActionBar';
import { FollowButton } from '../../src/primitives/FollowButton/FollowButton';
import { ReactionSummary, toggleReaction, type ReactionTally } from '../../src/primitives/ReactionSummary/ReactionSummary';
import { ReactionPicker, DEFAULT_REACTIONS } from '../../src/primitives/ReactionPicker/ReactionPicker';
import { Poll, type PollOption } from '../../src/primitives/Poll/Poll';
import { ThumbsFeedback } from '../../src/primitives/ThumbsFeedback/ThumbsFeedback';
import { Rating } from '../../src/primitives/Rating/Rating';
import { ShareButton } from '../../src/primitives/ShareButton/ShareButton';
import { NewItemsPill } from '../../src/primitives/NewItemsPill/NewItemsPill';
import { AudioWaveform } from '../../src/primitives/AudioWaveform/AudioWaveform';
import { AudioPlayer } from '../../src/primitives/AudioPlayer/AudioPlayer';
import { AudioTranscript, type TranscriptWord } from '../../src/primitives/AudioTranscript/AudioTranscript';
import { AudioLevelMeter } from '../../src/primitives/AudioLevelMeter/AudioLevelMeter';
import { VoiceRecorder } from '../../src/primitives/VoiceRecorder/VoiceRecorder';
import { CommentThread, type CommentNode } from '../../src/primitives/CommentThread/CommentThread';
import { Comment } from '../../src/primitives/Comment/Comment';
import { CommentComposer } from '../../src/primitives/CommentComposer/CommentComposer';
import { RichText } from '../../src/primitives/RichText/RichText';
import { ConversationList } from '../../src/primitives/ConversationList/ConversationList';
import { ConversationListItem } from '../../src/primitives/ConversationListItem/ConversationListItem';
import { TypingIndicator } from '../../src/primitives/TypingIndicator/TypingIndicator';
import { AnnotationLayer, type LayerPoint } from '../../src/primitives/AnnotationLayer/AnnotationLayer';
import { FeedbackPopover } from '../../src/primitives/FeedbackPopover/FeedbackPopover';
import { LinkPreview } from '../../src/primitives/LinkPreview/LinkPreview';

/** Everything the host reports, by fixture id; the Python side reads it. */
const ev: Record<string, any[]> = {};
const hooks: Record<string, (...args: any[]) => void> = {};
(window as any).ev = ev;
(window as any).hooks = hooks;
const log = (id: string, value: any) => (ev[id] ??= []).push(value);

function Box({ id, children }: { id: string; children: ReactNode }) {
  return <section id={id} style={{ margin: '0 0 24px' }}><h2 style={{ font: '600 12px sans-serif', margin: '0 0 6px' }}>{id}</h2>{children}</section>;
}

const Heart = <span>♡</span>;

function CountButtonFixture() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(164);
  return <Box id="count-button">
    <CountButton icon={Heart} activeIcon={<span>♥</span>} label="Like" count={count} countUnit="likes" pressed={liked} onPress={() => { setLiked(!liked); setCount(count + (liked ? -1 : 1)); }} />
    <output id="count-button-host">{count}</output>
  </Box>;
}

function ActionBarFixture() {
  return <Box id="action-bar">
    <ActionBar label="Post actions">
      <CountButton icon={<span>R</span>} label="Reply" count={3} countUnit="replies" />
      <CountButton icon={<span>T</span>} label="Repost" count={0} />
      <CountButton icon={<span>L</span>} label="Like" count={9} countUnit="likes" pressed={false} />
      <CountButton icon={<span>S</span>} label="Save" pressed={false} />
    </ActionBar>
  </Box>;
}

function FollowFixture() {
  const [following, setFollowing] = useState(false);
  return <Box id="follow"><FollowButton following={following} onToggle={() => setFollowing(!following)} name="Ava" /></Box>;
}

function ReactionSummaryFixture() {
  const [list, setList] = useState<ReactionTally[]>([
    { id: 'like', emoji: '👍', label: 'Like', count: 2 },
    { id: 'love', emoji: '❤️', label: 'Love', count: 1, mine: true },
  ]);
  const add = (id: string) => { const r = DEFAULT_REACTIONS.find((x) => x.id === id)!; setList((l) => toggleReaction(l, id, r.emoji, r.label)); log('reaction-summary', 'add:' + id); };
  return <Box id="reaction-summary"><ReactionSummary reactions={list} onToggle={(id) => setList((l) => toggleReaction(l, id))} onAdd={add} /></Box>;
}

function PickerFixture() {
  return <Box id="reaction-picker"><ReactionPicker onPick={(id) => log('reaction-picker', id)} /></Box>;
}

function PollFixture() {
  const [options, setOptions] = useState<PollOption[]>([{ id: 'a', label: 'Option A', votes: 3 }, { id: 'b', label: 'Option B', votes: 2 }, { id: 'c', label: 'Option C', votes: 2 }]);
  const [voted, setVoted] = useState<string | null>(null);
  return <Box id="poll"><Poll question="Pick one" options={options} voted={voted} onVote={(id) => { setVoted(id); setOptions((o) => o.map((x) => x.id === id ? { ...x, votes: x.votes + 1 } : x)); log('poll', id); }} /></Box>;
}

function ThumbsFixture() {
  return <Box id="thumbs"><ThumbsFeedback reasons={{ up: ['Clear'], down: ['Inaccurate', 'Unclear'] }} onRate={(v) => log('thumbs', { rate: v })} onSubmit={(r) => log('thumbs', { submit: r })} /></Box>;
}

function RatingFixture() {
  const [value, setValue] = useState(2);
  return <Box id="rating"><Rating label="Rate this reply" value={value} onChange={(v) => { setValue(v); log('rating', v); }} /><output id="rating-host">{value}</output><span id="rating-ro"><Rating label="Average rating" value={4} readOnly /></span></Box>;
}

function ShareFixture() {
  return <Box id="share"><ShareButton url="https://example.com/post/1" onShared={(m) => log('share', m)} /></Box>;
}

function PillFixture() {
  const [count, setCount] = useState(0);
  hooks.setPill = setCount;
  return <Box id="pill"><NewItemsPill count={count} onShow={() => log('pill', 'show')} /></Box>;
}

function WaveformFixture() {
  const [current, setCurrent] = useState(20);
  const peaks = Array.from({ length: 80 }, (_, i) => Math.abs(Math.sin(i / 5)));
  return <Box id="waveform"><AudioWaveform peaks={peaks} duration={60} current={current} label="Voice note from Ana" onSeek={(t) => { setCurrent(t); log('waveform', t); }} /></Box>;
}

/** Silent mono 8-bit WAV generated in the page, so no file or network is needed. */
function silentWav(seconds: number): string {
  const rate = 8000;
  const n = seconds * rate;
  const buf = new ArrayBuffer(44 + n);
  const v = new DataView(buf);
  const text = (at: number, s: string) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF'); v.setUint32(4, 36 + n, true); text(8, 'WAVE'); text(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  text(36, 'data'); v.setUint32(40, n, true);
  new Uint8Array(buf, 44).fill(128);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}
const wavA = silentWav(6);
const wavB = silentWav(6);

function PlayersFixture() {
  return <Box id="players"><AudioPlayer src={wavA} label="Clip A" variant="compact" /><AudioPlayer src={wavB} label="Clip B" variant="compact" /></Box>;
}

const WORDS: TranscriptWord[] = ['Hello', 'there', 'this', 'is', 'a', 'test'].map((text, i) => ({ text, start: i * 1.5, end: i * 1.5 + 1.2 }));
function TranscriptFixture() {
  const [t, setT] = useState(0);
  hooks.setTranscriptTime = setT;
  return <Box id="transcript"><AudioTranscript words={WORDS} current={t} label="Transcript of Voice note" onSeek={(s) => log('transcript', s)} /></Box>;
}

/** Keeps every stream the page opens so the gate can prove the microphone is released. */
const realGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
(window as any).__streams = [] as MediaStream[];
if (realGetUserMedia) navigator.mediaDevices.getUserMedia = async (c) => { const s = await realGetUserMedia(c); (window as any).__streams.push(s); return s; };

/** Records every AudioContext the page opens so the gate can prove none is left running. */
const NativeAudioContext = window.AudioContext;
(window as any).__ctxs = [] as AudioContext[];
if (NativeAudioContext) (window as any).AudioContext = class extends NativeAudioContext { constructor(...a: ConstructorParameters<typeof AudioContext>) { super(...a); (window as any).__ctxs.push(this); } };

// Separate React roots on one page: their useId values collide, which the one-player rule must survive.
const extraRoots: Record<string, { unmount: () => void }> = {};
/** Server-renders then hydrates, the case where useId is derived from tree position and repeats in every root. */
function hydrateInRoot(id: string, node: ReactNode) {
  let host = document.getElementById(id);
  if (!host) { host = document.createElement('div'); host.id = id; document.body.appendChild(host); }
  extraRoots[id]?.unmount();
  host.innerHTML = renderToString(node as any);
  extraRoots[id] = hydrateRoot(host, node as any);
}
function mountRoot(id: string, node: ReactNode) {
  let host = document.getElementById(id);
  if (!host) { host = document.createElement('div'); host.id = id; document.body.appendChild(host); }
  extraRoots[id]?.unmount();
  extraRoots[id] = createRoot(host);
  extraRoots[id].render(node);
}
hooks.mountStrictRecorder = () => mountRoot('strict-recorder', <React.StrictMode><VoiceRecorder autoStart onRecorded={(c) => log('strict-recorder', { size: c.blob.size })} /></React.StrictMode>);
hooks.mountEmptyMeter = () => mountRoot('empty-meter', <AudioLevelMeter stream={new MediaStream()} label="Empty stream meter" />);
hooks.mountRootPlayers = () => {
  hydrateInRoot('root-player-a', <AudioPlayer src={wavA} label="Root clip A" variant="compact" />);
  hydrateInRoot('root-player-b', <AudioPlayer src={wavB} label="Root clip B" variant="compact" />);
};
hooks.unmountRoot = (id: string) => { extraRoots[id]?.unmount(); delete extraRoots[id]; };

function RecorderFixture() {
  return <Box id="recorder"><VoiceRecorder onRecorded={(c) => log('recorder', { size: c.blob.size, duration: c.duration, peaks: c.peaks.length, mime: c.mimeType })} onCancel={() => log('recorder', 'cancel')} /></Box>;
}

type Note = { author: string; text: string };
const TREE: CommentNode<Note>[] = [{
  id: 'c1', author: 'Ava', text: 'Root comment',
  children: [
    { id: 'r1', author: 'Ben', text: 'Reply 1', children: [{ id: 'g1', author: 'Cy', text: 'Grandchild' }] },
    { id: 'r2', author: 'Ben', text: 'Reply 2' }, { id: 'r3', author: 'Ben', text: 'Reply 3' }, { id: 'r4', author: 'Ben', text: 'Reply 4' }, { id: 'r5', author: 'Ben', text: 'Reply 5' },
  ],
}];
function ThreadFixture() {
  return <Box id="thread"><CommentThread label="Comments" items={TREE} renderItem={(n, ctx) => <Comment author={n.author} avatar={<span style={{ display: 'block', width: 32, height: 32, borderRadius: 16, background: '#999' }} />} depth={ctx.depth} replies={ctx.replies}>{n.text}</Comment>} /></Box>;
}

function ComposerFixture() {
  const [value, setValue] = useState('');
  const [recording, setRecording] = useState(false);
  const [reply, setReply] = useState(true);
  return <Box id="composer">
    <CommentComposer value={value} onValueChange={setValue} maxLength={20}
      onSubmit={(v) => { log('composer', { submit: v }); setValue(''); }}
      replyingTo={reply ? { author: 'Ben', excerpt: 'See you soon' } : undefined} onCancelReply={() => { log('composer', 'cancel-reply'); setReply(false); }}
      recorder={recording ? <button type="button" id="composer-recorder-inner">Recording</button> : undefined}
      tools={<button type="button" aria-label="Attach">+</button>} />
    <button type="button" id="composer-toggle-recorder" onClick={() => setRecording(!recording)}>toggle recorder</button>
    <button type="button" id="composer-show-reply" onClick={() => setReply(true)}>show reply</button>
  </Box>;
}

function RichTextFixture() {
  return <Box id="rich"><p><RichText text={'See https://example.com/a and javascript:alert(1) and www.good.org/x and [click](javascript:alert(2)) data:text/html,hi ftp://files.example.com/x'} /></p></Box>;
}

function ConversationFixture() {
  const [order, setOrder] = useState(['c1', 'c2', 'c3', 'c4']);
  hooks.moveToTop = (id: string) => setOrder((o) => [id, ...o.filter((x) => x !== id)]);
  const rows: Record<string, string> = { c1: 'Design team', c2: 'Ben', c3: 'Cy', c4: 'Dee' };
  return <Box id="conversations"><ConversationList label="Conversations" order={order}>
    {Object.entries(rows).map(([id, title]) => <ConversationListItem key={id} id={id} title={title} avatar={<span>{title[0]}</span>} preview="Hello" time="9:41 AM" unread={id === 'c3' ? 2 : 0} onSelect={(x) => log('conversations', x)} />)}
  </ConversationList></Box>;
}

function TypingFixture() {
  const [names, setNames] = useState<string[]>([]);
  hooks.setTyping = setNames;
  return <Box id="typing"><TypingIndicator names={names} /></Box>;
}

function AnnotationFixture() {
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState<LayerPoint | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  hooks.setAnnotationActive = setActive;
  return <Box id="annotation">
    <button type="button" id="annotation-toggle" onClick={() => setActive(!active)}>comment mode</button>
    <div style={{ width: 400 }}>
      <AnnotationLayer label="Landing page" active={active} onActiveChange={setActive} pins={[{ id: 'p1', x: 0.8, y: 0.2 }]} draft={draft} selectedId={selected}
        onPlace={(p) => { log('annotation', { place: p }); setDraft(p); }} onSelect={(id) => { setSelected(id); if (id === null) setDraft(null); }}
        renderPopover={() => <FeedbackPopover open onOpenChange={(o) => { if (!o) { log('annotation', 'close'); setDraft(null); setSelected(null); } }} onSubmit={(t) => log('annotation', { submit: t })} />}>
        <div style={{ width: 400, height: 300, background: '#eee' }}><button type="button" onClick={() => log('annotation', 'underlying-click')}>Underlying</button></div>
      </AnnotationLayer>
    </div>
  </Box>;
}

function LinkFixture() {
  return <Box id="links">
    <div id="link-safe"><LinkPreview url="https://example.com/article" title="An article" siteName="Example" description="Summary" /></div>
    <div id="link-unsafe"><LinkPreview url="javascript:alert(1)" title="Unsafe card" /></div>
  </Box>;
}

createRoot(document.getElementById('root')!).render(<>
  <CountButtonFixture /><ActionBarFixture /><FollowFixture /><ReactionSummaryFixture /><PickerFixture /><PollFixture /><ThumbsFixture />
  <RatingFixture /><ShareFixture /><PillFixture /><WaveformFixture /><PlayersFixture /><TranscriptFixture /><RecorderFixture />
  <ThreadFixture /><ComposerFixture /><RichTextFixture /><ConversationFixture /><TypingFixture /><AnnotationFixture /><LinkFixture />
</>);
(window as any).ready = true;

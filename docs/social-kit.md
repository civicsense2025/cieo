# Social, audio and engagement kit

Components for threaded discussion, voice notes, reactions, group messaging and pin-and-comment review. They are plain primitives (`cieo/<Name>`), so any app can use them; hosts own data, uploads, permissions and moderation.

## Contents

- [Pieces by layer](#pieces-by-layer)
- [A thread with nested replies](#a-thread-with-nested-replies)
- [Audio in comment threads](#audio-in-comment-threads)
- [Group messaging](#group-messaging)
- [Pin-and-comment review](#pin-and-comment-review)
- [Motion and accessibility rules](#motion-and-accessibility-rules)
- [Checking it](#checking-it)

## Pieces by layer

| Area | Atoms | Molecules | Organisms |
| --- | --- | --- | --- |
| Audio | AudioPlayButton, AudioWaveform, PlaybackRateButton, AudioTime, AudioLevelMeter, SpeakerTile | AudioPlayer, AudioTranscript, VoiceRecorder | AudioRoom |
| Comments | ByLine, ReplyPreview, CharacterCountRing, VerifiedBadge, Mention, RichText, NewItemsPill | Comment, CommentComposer, LinkPreview | CommentThread |
| Engagement | CountButton, CompactCount, FollowButton, NotifyToggle, ShareButton, Rating | ActionBar, ReactionPicker, ReactionSummary, Poll, ThumbsFeedback | |
| Messaging | TypingIndicator, DeliveryStatus, UnreadDivider, GroupAvatar | SeenBy, ConversationListItem | ConversationList |
| Review | AnnotationPin | FeedbackPopover, ActivityItem | AnnotationLayer |

Every component page lives under `site/components/<Name>.html`; live motion demos are in the catalogue under Audio, Comments, Messaging and Feedback. Apple apps get the same components, names and rules in `CieoUI`; see [Apple components](apple-components.md).

## A thread with nested replies

`CommentThread` manages the tree (which branches are open, how many replies show, how deep nesting goes). `Comment` draws one post. The host renders each comment, so any slot can hold anything.

```tsx
const tree = buildCommentTree(rows); // [{ id, parentId, ... }] -> nested, input order kept

<CommentThread
  label="Replies"
  items={tree}
  initialReplies={2}
  renderItem={(c, { depth, replies }) => (
    <Comment
      author={c.author}
      avatar={<Avatar name={c.author} initials={c.initials} src={c.photo} size={depth ? 'sm' : 'md'} />}
      badge={c.verified ? <VerifiedBadge /> : undefined}
      context={c.topic}
      time={c.ago}
      dateTime={c.at}
      menu={<MoreMenu label={`More for ${c.author}'s comment`}>…</MoreMenu>}
      attachments={c.link ? <LinkPreview {...c.link} /> : undefined}
      actions={
        <ActionBar label={`Actions for ${c.author}'s comment`}>
          <CountButton icon={<Heart />} activeIcon={<HeartFilled />} label="Like" count={c.likes} countUnit="likes" pressed={c.liked} tone="danger" onPress={() => like(c.id)} />
          <CountButton icon={<Reply />} label="Reply" count={c.replyCount} countUnit="replies" onPress={() => replyTo(c)} />
          <CountButton icon={<Repost />} label="Repost" count={c.reposts} countUnit="reposts" />
          <ShareButton url={c.permalink} />
        </ActionBar>
      }
      replies={replies}
    >
      <RichText text={c.body} hrefFor={{ mention: (h) => `/@${h}` }} />
    </Comment>
  )}
/>
```

The slots are not reaction-only. `actions` takes any icon actions (bookmark, translate, report, "send to an agent"), and `attachments` takes any media.

## Audio in comment threads

Voice replies use the same slots as text, so a thread never needs a separate "audio comment" type.

1. **Recording.** Put a mic `IconButton` in the composer's `tools`. When it is pressed, pass a `VoiceRecorder` as the composer's `recorder`; the text row cross-fades to the recorder and focus moves into it. Escape or Cancel discards and never emits a clip.
2. **Review before posting.** `onRecorded` hands back `{ blob, mimeType, duration, peaks }`. Keep it in state and show it in the composer's `attachments` as a compact `AudioPlayer` with a remove button; set `hasAttachments` so Post works with no text.
3. **Posting.** Upload the blob (the host owns storage, size limits and moderation), then store `duration` and `peaks` with the comment so players draw the waveform without decoding audio.
4. **Playing.** Render `<AudioPlayer variant="compact" src={c.audioUrl} peaks={c.peaks} duration={c.duration} label={`Voice reply from ${c.author}`} />` in the comment's `attachments`. Only one player plays at a time across the page.
5. **Transcripts.** When the host has word timings, put an `AudioTranscript` under the player (fed by the player's `onTimeUpdate`) so readers can skim, search and jump. Treat a transcript as the accessible alternative to the clip.

```tsx
const [recording, setRecording] = useState(false);
const [clip, setClip] = useState<Clip | null>(null);

<CommentComposer
  value={text}
  onValueChange={setText}
  onSubmit={() => post({ text, clip })}
  avatar={<Avatar name={me.name} initials={me.initials} size="sm" />}
  tools={<IconButton label="Record a voice reply" onClick={() => setRecording(true)}><Mic /></IconButton>}
  recorder={recording ? <VoiceRecorder autoStart onCancel={() => setRecording(false)} onRecorded={(c) => { setClip(c); setRecording(false); }} /> : undefined}
  attachments={clip ? <AudioPlayer variant="compact" src={clipUrl} peaks={clip.peaks} duration={clip.duration} label="Your voice reply" /> : undefined}
  hasAttachments={!!clip}
  maxLength={500}
/>
```

`clipUrl` comes from `URL.createObjectURL(clip.blob)`; revoke it when the clip is removed or posted. Live audio (spaces, town halls) uses `AudioRoom` with `SpeakerTile`; the host owns the real-time connection and feeds each speaker's level.

## Group messaging

`ConversationList` holds `ConversationListItem` rows and slides a conversation to the top when its `order` changes. Rows show `GroupAvatar` for groups, a `TypingIndicator` in place of the preview while people type, and unread counts. Inside a conversation, pair the existing `ChatMessageList` and `ChatMessageBubble` with `DeliveryStatus`, `SeenBy`, `UnreadDivider`, `ReactionSummary` and a compact `AudioPlayer` for voice messages.

## Pin-and-comment review

`AnnotationLayer` wraps any content. In comment mode a click (or arrow keys plus Enter) drops a numbered `AnnotationPin`, and `FeedbackPopover` opens beside it, flipping sides near an edge. The host stores pins as fractions of the layer (`x`, `y` from 0 to 1), so they stay put when the layout resizes. `ActivityItem` lists what happened (replies, reactions, mentions) in an activity feed.

## Motion and accessibility rules

- Presses use the snap spring, indicators and reflow use base, progress and size changes use soft; nothing bounces.
- Counts roll in the direction of change; new comments and chips arrive from 0.45 opacity, never from nothing.
- Reduced motion keeps every state change and drops the travel.
- Every gesture has a keyboard path: scrubbing (arrow keys), reordering, hold-to-record (tap instead), pin placement (reticle and Enter).
- Clocks and level meters never sit in live regions; only discrete events are announced (recording started, vote counted, link copied).
- User text is untrusted. `RichText`, `Mention`, `LinkPreview` and `ByLine` only link http and https addresses.
- `LinkPreview` images and favicons require absolute credential-free http(s) URLs; relative paths are rejected to avoid implicit same-origin asset requests. An absolute same-origin asset can still receive same-origin cookies, so supplying one is an explicit host trust decision. `referrerPolicy="no-referrer"` limits referrer disclosure but does not prevent a request. External assets still disclose visitor IP and network metadata; production hosts should proxy/cache them or use an approved host. Invalid schemes and credential-bearing URLs stay blocked.

## Checking it

- `npm test` runs the unit tests for every component (pure helpers, state machines, server-rendered markup).
- `npm run test:social` drives every interactive piece in a real browser, with and without reduced motion: liking, reacting, voting, scrubbing, recording from a fake microphone, expanding replies, posting, placing review pins. It fails on any page or console error.

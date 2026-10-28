# Poll

A question with options that become result bars in place once the person votes or the poll closes.

## Use when

- A quick poll in a thread, comment or announcement.
- Results should appear the moment someone votes.

## Avoid when

- Multiple-choice answers or ranking.
- Votes must stay hidden until the poll ends; hide results in the host instead.

## Anatomy

A question, a group of options, a total line (CompactCount) and an optional footnote. Each option is one row that is a button before voting and a result bar after.

## Behavior

- Before a vote (and not closed) options are `role="radio"` buttons in a `radiogroup`.
- After a vote, or when `closed`, the same rows show result bars. Fills grow on the soft spring, staggered 50ms; percentages count up.
- `pollPercentages(votes)` rounds by largest remainder so the shown percentages sum to exactly 100 (all zeros with no votes).
- The chosen row keeps a check; the leader (or every tied leader) is emphasised.
- A polite live region says "Vote counted. Option A leads with 54%." once, when the person's vote arrives.

## Keyboard / accessibility

- Arrow keys move focus between options; Enter or Space votes.
- Results are a list; each row reads "54%, 120 votes" and "Your vote" where it applies.

## Do / don't

- Do: show the total so a single vote is not read as a landslide.
- Don't: let people vote again once `voted` is set.

## Customization

Use `footnote` for closing time or visibility. Colors come from tokens.

## Limitations

- Single choice only.
- Counts must come from the host; the poll does not add the person's vote itself.

## Related

CompactCount, ReactionSummary.

## Evidence

`test/primitives-engagement-reactions.test.mjs`.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `question`, `options`, `total`, `closed`, `footnote`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

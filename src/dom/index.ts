/* DOM helpers on the spring core. Each returns cancel(), which ends the motion at its final state.
   When motion is not allowed a helper applies the final state at once. Only transform, opacity,
   filter and clip-path move; inline styles a helper touched are restored exactly when it finishes,
   and will-change is set only while something moves. */
export { owners, list, gapFor, hold, animate, paint, type Cancel, type From, type Targets } from './paint.js';
export { enter, exit, swap, track, type PresenceOptions, type SwapOptions } from './presence.js';
export { longMove, flip, type FlipOptions } from './flip.js';
export { digits } from './digits.js';
export { edges, type EdgesAxis, type EdgesOptions, type Span } from './edges.js';
export { reveal, revealNow, scrollTo } from './scroll.js';

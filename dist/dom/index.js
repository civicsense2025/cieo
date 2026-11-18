/* DOM helpers on the spring core. Each returns cancel(), which ends the motion at its final state.
   When motion is not allowed a helper applies the final state at once. Only transform, opacity,
   filter and clip-path move; inline styles a helper touched are restored exactly when it finishes,
   and will-change is set only while something moves. */
export { owners, list, gapFor, hold, animate, paint } from './paint.js';
export { enter, exit, swap, track } from './presence.js';
export { longMove, flip } from './flip.js';
export { digits } from './digits.js';
export { edges } from './edges.js';
export { reveal, revealNow, scrollTo } from './scroll.js';

'use client';
/* React bindings: thin hooks over the spring core and DOM helpers. They write to the DOM directly while
   something moves, so a spring never re-renders the component tree per frame. */
export { useReducedMotion, useSpring, useSpringValue, useSwapEffect, useEdges, useFlip, usePresence, type SpringOptions } from './hooks.js';
export { useSwap, SwapText, Digits, type Swap } from './swap.js';
export { roveIndex, enabledIn, roveFocus, useDismiss, useModalFocus, useDismissibleHint, type RoveKey } from './interaction.js';
export {
  useGestureSpring,
  useSharedAxis,
  type GestureBounds,
  type GestureReleaseInfo,
  type UseGestureSpringOptions,
  type GestureSpringResult,
  type SharedAxisOptions,
} from './gesture.js';
export { S, EXIT, LAG, ARRIVE, Track, allowed, now, resp, prog, setMotionState, subtreeReduced, REDUCED_SUBTREE } from '../core/spring.js';
export type { Preset, SpringConfig, MotionKind } from '../core/spring.js';

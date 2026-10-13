/* Shared motion contract for primitives. Components that animate set data attributes
   (or take MotionProps); design/styles/primitives/motion.css owns every rule. */
export type MotionChoice = 'none' | 'fade' | 'rise' | 'scale';
export interface MotionProps {
  /** False renders the end state instantly. Defaults to true. */
  motion?: boolean;
  /** Entering behavior. Default is set per component. */
  entering?: MotionChoice;
  /** Exiting behavior. Defaults to the entering value. */
  exiting?: MotionChoice;
}
export interface MotionAttrs {
  'data-motion': 'on' | 'off';
  'data-entering'?: MotionChoice;
  'data-exiting'?: MotionChoice;
}
export function motionAttrs(o: MotionProps = {}): MotionAttrs {
  if (o.motion === false) return { 'data-motion': 'off' };
  const attrs: MotionAttrs = { 'data-motion': 'on' };
  if (o.entering !== undefined) attrs['data-entering'] = o.entering;
  if (o.exiting !== undefined) attrs['data-exiting'] = o.exiting;
  return attrs;
}

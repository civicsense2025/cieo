'use client';
import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { popoverPosition, type PopoverPositionOptions } from './position.js';
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function usePopoverPosition(open: boolean, anchor: RefObject<HTMLElement | null>, panel: HTMLElement | null, options: PopoverPositionOptions) {
  const [position, setPosition] = useState<ReturnType<typeof popoverPosition> | null>(null);
  useIso(() => {
    if (!open) { setPosition(null); return; }
    const trigger = anchor.current, content = panel;
    if (!trigger || !content) return;
    let frame = 0;
    const measure = () => {
      const viewport = window.visualViewport;
      const bounds = { left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0,
        width: viewport?.width ?? document.documentElement.clientWidth, height: viewport?.height ?? window.innerHeight };
      const next = popoverPosition(trigger.getBoundingClientRect(), content.getBoundingClientRect(), bounds,
        { ...options, rtl: getComputedStyle(trigger).direction === 'rtl' });
      setPosition((old) => old && Object.keys(next).every((key) => old[key as keyof typeof old] === next[key as keyof typeof next]) ? old : next);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(trigger); observer.observe(content);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('resize', schedule); window.removeEventListener('scroll', schedule, true);
      window.visualViewport?.removeEventListener('resize', schedule); window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, [open, anchor, panel, options.side, options.align, options.offset, options.padding]);
  return position;
}

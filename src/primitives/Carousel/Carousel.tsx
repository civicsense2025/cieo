// src/primitives/Carousel/Carousel.tsx
'use client';
/* Carousel. Scroll-snap region with previous/next buttons. Buttons scroll by one visible page. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { useRef, type ReactNode } from 'react';
import { scrollTo } from '../../dom/scroll.js';

export interface CarouselProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; track?: PrimitivePartProps; previous?: PrimitivePartProps; next?: PrimitivePartProps };
  /** Accessible name for the carousel region (e.g. "Featured guides"). Required. */
  label: string;
  /** False renders the end state instantly via data-motion="off". Defaults to true. */
  motion?: boolean;
  children: ReactNode;
}

export function Carousel({ label, motion, children, className, slotProps }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) motion === false ? track.scrollBy({ left: direction * track.clientWidth }) : scrollTo(track, track.scrollLeft + direction * track.clientWidth);
  };
  return (
    <div className="cieo cieo-carousel" data-motion={motion === false ? 'off' : undefined} {...customizePart(slotProps?.root, "cieo cieo-carousel", undefined, className)}>
      <div ref={trackRef} role="region" aria-label={label} tabIndex={0} className="cieo cieo-carousel-track" {...customizePart(slotProps?.track, "cieo cieo-carousel-track", undefined)}>
        {children}
      </div>
      <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous items" {...customizePart(slotProps?.previous, undefined, undefined)}>
        Previous
      </button>
      <button type="button" onClick={() => scrollBy(1)} aria-label="Next items" {...customizePart(slotProps?.next, undefined, undefined)}>
        Next
      </button>
    </div>
  );
}

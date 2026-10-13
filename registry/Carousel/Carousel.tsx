// src/primitives/Carousel/Carousel.tsx
'use client';
/* Carousel. Scroll-snap region with previous/next buttons. Buttons scroll by one visible page. */
import { useRef, type ReactNode } from 'react';
import { scrollTo } from '../../dom/scroll.js';

export interface CarouselProps {
  /** Accessible name for the carousel region (e.g. "Featured guides"). Required. */
  label: string;
  /** False renders the end state instantly via data-motion="off". Defaults to true. */
  motion?: boolean;
  children: ReactNode;
}

export function Carousel({ label, motion, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) motion === false ? track.scrollBy({ left: direction * track.clientWidth }) : scrollTo(track, track.scrollLeft + direction * track.clientWidth);
  };
  return (
    <div className="cieo cieo-carousel" data-motion={motion === false ? 'off' : undefined}>
      <div ref={trackRef} role="region" aria-label={label} className="cieo cieo-carousel-track">
        {children}
      </div>
      <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous items">
        Previous
      </button>
      <button type="button" onClick={() => scrollBy(1)} aria-label="Next items">
        Next
      </button>
    </div>
  );
}

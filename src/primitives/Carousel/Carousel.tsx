// src/primitives/Carousel/Carousel.tsx
'use client';
/* Carousel. Scroll-snap region with previous/next buttons. Buttons scroll by one visible page. */
import { useRef, type ReactNode } from 'react';

export interface CarouselProps {
  /** Accessible name for the carousel region (e.g. "Featured guides"). Required. */
  label: string;
  children: ReactNode;
}

export function Carousel({ label, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth });
  };
  return (
    <div className="cieo cieo-carousel">
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

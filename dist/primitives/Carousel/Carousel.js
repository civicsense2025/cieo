// src/primitives/Carousel/Carousel.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Carousel. Scroll-snap region with previous/next buttons. Buttons scroll by one visible page. */
import { useRef } from 'react';
export function Carousel({ label, children }) {
    const trackRef = useRef(null);
    const scrollBy = (direction) => {
        const track = trackRef.current;
        if (track)
            track.scrollBy({ left: direction * track.clientWidth });
    };
    return (_jsxs("div", { className: "cieo cieo-carousel", children: [_jsx("div", { ref: trackRef, role: "region", "aria-label": label, className: "cieo cieo-carousel-track", children: children }), _jsx("button", { type: "button", onClick: () => scrollBy(-1), "aria-label": "Previous items", children: "Previous" }), _jsx("button", { type: "button", onClick: () => scrollBy(1), "aria-label": "Next items", children: "Next" })] }));
}

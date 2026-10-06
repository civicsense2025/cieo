/* Small stroke icons shared by the controls. They draw in currentColor and are always decorative. */

const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, focusable: false };

export const CheckIcon = ({ draw = false, width = 2.5 }: { draw?: boolean; width?: number }) => (
  <svg {...base} strokeWidth={width} className="cieo-icon">
    <path d="M5 12.5 10 17.5 19 7" {...(draw ? { pathLength: 1, className: 'cieo-draw' } : {})} />
  </svg>
);

export const AlertIcon = () => (
  <svg {...base} strokeWidth={2.25} className="cieo-icon">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5h.01" />
  </svg>
);

export const ChevronIcon = () => (
  <svg {...base} strokeWidth={2} className="cieo-icon cieo-chevron">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const SpinnerIcon = () => (
  <svg {...base} strokeWidth={2.25} className="cieo-icon cieo-spin">
    <path d="M12 3a9 9 0 0 1 9 9" />
  </svg>
);

export const SearchIcon = () => (
  <svg {...base} strokeWidth={2} className="cieo-icon">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base} strokeWidth={2} className="cieo-icon">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Small stroke icons shared by the controls. They draw in currentColor and are always decorative. */
const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false };
export const CheckIcon = ({ draw = false, width = 2.5 }) => (_jsx("svg", { ...base, strokeWidth: width, className: "cieo-icon", children: _jsx("path", { d: "M5 12.5 10 17.5 19 7", ...(draw ? { pathLength: 1, className: 'cieo-draw' } : {}) }) }));
export const AlertIcon = () => (_jsxs("svg", { ...base, strokeWidth: 2.25, className: "cieo-icon", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7.5v5.5M12 16.5h.01" })] }));
export const ChevronIcon = () => (_jsx("svg", { ...base, strokeWidth: 2, className: "cieo-icon cieo-chevron", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
export const SpinnerIcon = () => (_jsx("svg", { ...base, strokeWidth: 2.25, className: "cieo-icon cieo-spin", children: _jsx("path", { d: "M12 3a9 9 0 0 1 9 9" }) }));
export const SearchIcon = () => (_jsxs("svg", { ...base, strokeWidth: 2, className: "cieo-icon", children: [_jsx("circle", { cx: "11", cy: "11", r: "7" }), _jsx("path", { d: "m20 20-3.5-3.5" })] }));
export const CloseIcon = () => (_jsx("svg", { ...base, strokeWidth: 2, className: "cieo-icon", children: _jsx("path", { d: "M18 6 6 18M6 6l12 12" }) }));

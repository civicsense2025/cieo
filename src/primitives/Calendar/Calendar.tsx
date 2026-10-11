'use client';
// src/primitives/Calendar/Calendar.tsx
/* Calendar. Month grid for picking one ISO date. Flat group semantics (role=group, no grid roles); day buttons report selection via aria-pressed. */
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface CalendarProps {
  /** Full year (e.g. 2026). Required. */
  year: number;
  /** Month of year, 1-12. Required. */
  month: number;
  /** Selected day as an ISO date (YYYY-MM-DD). Optional. */
  selected?: string;
  /** Called with the ISO date when a day is picked. Optional. */
  onSelect?: (iso: string) => void;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function Calendar({ year, month, selected, onSelect }: CalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadBlanks = new Date(year, month - 1, 1).getDay();
  const days: Array<string | null> = [
    ...Array<null>(leadBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`),
  ];
  return (
    <div role="group" aria-label={`${year}-${month}`} className="cieo cieo-p-calendar">
      {WEEKDAYS.map((d) => (
        <span key={d} className="cieo-p-calendar-weekday" aria-hidden="true">
          {d}
        </span>
      ))}
      {days.map((iso, i) =>
        iso === null ? (
          <span key={`blank-${i}`} className="cieo-p-calendar-blank" aria-hidden="true" />
        ) : (
          <button key={iso} type="button" className="cieo-p-calendar-day" aria-pressed={selected === iso} aria-label={iso} onClick={() => onSelect?.(iso)}>
            {Number(iso.slice(8))}
          </button>
        ),
      )}
    </div>
  );
}

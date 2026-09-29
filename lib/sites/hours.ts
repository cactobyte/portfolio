import type { OpeningHours, Weekday } from "./types";

const DAY_MINUTES = 24 * 60;
const WEEK_MINUTES = 7 * DAY_MINUTES;
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
/** Display order: the working week first. */
const WEEK_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const hkFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Hong_Kong",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes since Sunday 00:00, Hong Kong time. */
export function hongKongWeekMinute(date: Date): number {
  const parts = Object.fromEntries(hkFormatter.formatToParts(date).map((p) => [p.type, p.value]));
  const day = DAY_SHORT.indexOf(parts.weekday as (typeof DAY_SHORT)[number]);
  return day * DAY_MINUTES + Number(parts.hour) * 60 + Number(parts.minute);
}

interface Shift {
  start: number;
  end: number;
  open: string;
  close: string;
}

function shifts(hours: OpeningHours[]): Shift[] {
  return hours.flatMap((entry) => {
    const open = toMinutes(entry.open);
    let close = toMinutes(entry.close);
    if (close <= open) close += DAY_MINUTES;
    return entry.days.map((day) => ({
      start: day * DAY_MINUTES + open,
      end: day * DAY_MINUTES + close,
      open: entry.open,
      close: entry.close,
    }));
  });
}

export type OpenState =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; label: string }
  | { open: false; opensAt: null; label: null };

export function openState(hours: OpeningHours[], now: Date): OpenState {
  const minute = hongKongWeekMinute(now);
  const all = shifts(hours);

  // A shift can spill past Saturday midnight into the next week, so test both offsets.
  const current = all.find((s) =>
    [minute, minute + WEEK_MINUTES].some((m) => m >= s.start && m < s.end),
  );
  if (current) return { open: true, closesAt: current.close };

  let next: Shift | null = null;
  let wait = Infinity;
  for (const s of all) {
    const w = (s.start - minute + WEEK_MINUTES) % WEEK_MINUTES;
    if (w < wait) {
      wait = w;
      next = s;
    }
  }
  if (!next) return { open: false, opensAt: null, label: null };

  const today = Math.floor(minute / DAY_MINUTES);
  const nextDay = Math.floor(next.start / DAY_MINUTES);
  const daysAhead = (nextDay - today + 7) % 7;
  const label = daysAhead === 0 ? "today" : daysAhead === 1 ? "tomorrow" : DAY_SHORT[nextDay];
  return { open: false, opensAt: next.open, label };
}

function formatDays(days: Weekday[]): string {
  const ordered = WEEK_ORDER.filter((d) => days.includes(d));
  if (ordered.length === 7) return "Daily";

  const runs: Weekday[][] = [];
  for (const day of ordered) {
    const run = runs.at(-1);
    const prev = run?.at(-1);
    if (run && prev !== undefined && WEEK_ORDER.indexOf(day) === WEEK_ORDER.indexOf(prev) + 1) {
      run.push(day);
    } else {
      runs.push([day]);
    }
  }
  return runs
    .map((run) =>
      run.length >= 3
        ? `${DAY_SHORT[run[0]]}–${DAY_SHORT[run[run.length - 1]]}`
        : run.map((d) => DAY_SHORT[d]).join(", "),
    )
    .join(", ");
}

export function formatHours(hours: OpeningHours[]): { days: string; time: string }[] {
  return hours.map((entry) => ({ days: formatDays(entry.days), time: `${entry.open}–${entry.close}` }));
}

/** Days that appear in no entry, e.g. a weekly closing day. */
export function closedDays(hours: OpeningHours[]): string | null {
  const open = new Set(hours.flatMap((h) => h.days));
  const closed = WEEK_ORDER.filter((d) => !open.has(d));
  return closed.length ? formatDays(closed) : null;
}

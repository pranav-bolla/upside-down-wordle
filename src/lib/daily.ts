import { LAUNCH_DATE_UTC } from "./config";

const DAY_MS = 86_400_000;

/** Sequential challenge number for a moment in time. Rolls over at 00:00 UTC. */
export function dayNumberAt(ms: number): number {
  return Math.max(1, Math.floor((ms - LAUNCH_DATE_UTC) / DAY_MS) + 1);
}

export function msUntilNextDay(ms: number): number {
  return DAY_MS - (((ms % DAY_MS) + DAY_MS) % DAY_MS);
}

export function formatDayNumber(day: number): string {
  return String(day).padStart(3, "0");
}

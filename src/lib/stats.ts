import { MAX_SCORE } from "./config";

export interface Stats {
  played: number;
  totalScore: number;
  perfects: number;
  currentStreak: number;
  longestStreak: number;
  /** Challenge number of the most recently finished game, or 0. */
  lastCompletedDay: number;
}

export const EMPTY_STATS: Stats = {
  played: 0,
  totalScore: 0,
  perfects: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDay: 0,
};

export function recordGame(stats: Stats, day: number, score: number): Stats {
  if (stats.lastCompletedDay >= day) return stats;
  const currentStreak =
    stats.lastCompletedDay === day - 1 ? stats.currentStreak + 1 : 1;
  return {
    played: stats.played + 1,
    totalScore: stats.totalScore + score,
    perfects: stats.perfects + (score === MAX_SCORE ? 1 : 0),
    currentStreak,
    longestStreak: Math.max(stats.longestStreak, currentStreak),
    lastCompletedDay: day,
  };
}

/** A streak only counts while yesterday's (or today's) challenge was finished. */
export function liveStreak(stats: Stats, today: number): number {
  return stats.lastCompletedDay >= today - 1 ? stats.currentStreak : 0;
}

export function averageScore(stats: Stats): number {
  return stats.played ? Math.round(stats.totalScore / stats.played) : 0;
}

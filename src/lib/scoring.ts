import type { RoundState } from "./game";

/** Points by number of guesses used (index 0 = first guess). */
const POINTS = [100, 75, 50, 25, 10];

export function roundPoints(round: RoundState): number {
  if (round.status !== "won") return 0;
  return POINTS[round.guesses.length - 1] ?? 0;
}

export function totalScore(rounds: RoundState[]): number {
  return rounds.reduce((sum, round) => sum + roundPoints(round), 0);
}

export function ratingFor(score: number): string {
  if (score >= 300) return "You can read.";
  if (score >= 250) return "Almost literate.";
  if (score >= 175) return "Have you tried turning your phone?";
  if (score >= 75) return "This is concerning.";
  return "We need to talk.";
}

export function roundEmoji(round: RoundState): string {
  if (round.status !== "won") return "🟥";
  const used = round.guesses.length;
  if (used === 1) return "🟩";
  if (used <= 3) return "🟨";
  return "🟧";
}

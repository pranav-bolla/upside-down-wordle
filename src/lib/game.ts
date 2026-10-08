import { MAX_GUESSES, ROUND_COUNT } from "./config";

export type RoundStatus = "playing" | "won" | "lost";

export interface RoundState {
  /** Every submitted guess, in order. For a won round the last one is correct. */
  guesses: string[];
  status: RoundStatus;
}

export interface GameState {
  day: number;
  rounds: RoundState[];
}

export type GuessResult = "ignored" | "wrong" | "correct" | "failed";

export function createGame(day: number): GameState {
  return {
    day,
    rounds: Array.from({ length: ROUND_COUNT }, () => ({
      guesses: [],
      status: "playing" as const,
    })),
  };
}

/** Capitals matter: only the surrounding whitespace is forgiven. */
export function normalizeGuess(raw: string): string {
  return raw.trim();
}

/** Right letters, wrong capitalisation. */
export function isCaseMiss(guess: string, word: string): boolean {
  return guess !== word && guess.toLowerCase() === word.toLowerCase();
}

/** Index of the round still being played, or -1 once the day is finished. */
export function activeRoundIndex(game: GameState): number {
  return game.rounds.findIndex((round) => round.status === "playing");
}

export function isComplete(game: GameState): boolean {
  return activeRoundIndex(game) === -1;
}

export function hasStarted(game: GameState): boolean {
  return game.rounds.some((round) => round.guesses.length > 0);
}

export function wrongGuesses(round: RoundState): string[] {
  return round.status === "won" ? round.guesses.slice(0, -1) : round.guesses;
}

export function guessesRemaining(round: RoundState): number {
  return MAX_GUESSES - wrongGuesses(round).length;
}

/** Pure: returns the next game state and what happened. */
export function applyGuess(
  game: GameState,
  raw: string,
  words: string[],
): { game: GameState; result: GuessResult } {
  const index = activeRoundIndex(game);
  const guess = normalizeGuess(raw);
  if (index === -1 || !guess) return { game, result: "ignored" };

  const round = game.rounds[index];
  const guesses = [...round.guesses, guess];
  let result: GuessResult = "wrong";
  let status: RoundStatus = "playing";

  if (guess === words[index]) {
    result = "correct";
    status = "won";
  } else if (guesses.length >= MAX_GUESSES) {
    result = "failed";
    status = "lost";
  }

  const rounds = game.rounds.map((r, i) => (i === index ? { guesses, status } : r));
  return { game: { ...game, rounds }, result };
}

export function isValidGame(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const game = value as GameState;
  return (
    Number.isInteger(game.day) &&
    Array.isArray(game.rounds) &&
    game.rounds.length === ROUND_COUNT &&
    game.rounds.every(
      (round) =>
        round &&
        Array.isArray(round.guesses) &&
        round.guesses.every((g) => typeof g === "string") &&
        ["playing", "won", "lost"].includes(round.status),
    )
  );
}

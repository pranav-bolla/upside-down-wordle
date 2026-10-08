import type { GameState, GuessResult } from "./game";
import type { Stats } from "./stats";

/** Everything the client needs to render one player's challenge. */
export interface StatePayload {
  words: string[];
  game: GameState;
  stats: Stats;
}

export interface GuessRequest {
  day: number;
  /** The round the player was looking at when they guessed. */
  round: number;
  guess: string;
}

export interface GuessResponse {
  /** "stale" means that day can no longer be played; `state` is today's. */
  result: GuessResult | "stale";
  state: StatePayload;
}

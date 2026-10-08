import type { PoolClient } from "pg";
import type { GuessResponse, StatePayload } from "../lib/api";
import { dayNumberAt } from "../lib/daily";
import {
  activeRoundIndex,
  applyGuess,
  createGame,
  hasStarted,
  isComplete,
  type RoundState,
} from "../lib/game";
import { totalScore } from "../lib/scoring";
import { EMPTY_STATS, recordGame, type Stats } from "../lib/stats";
import { getChallenge } from "./challenges";
import { db, transaction } from "./db";

interface PlayerRow {
  played: number;
  total_score: number;
  perfects: number;
  current_streak: number;
  longest_streak: number;
  last_completed_day: number;
}

const PLAYER_COLUMNS =
  "played, total_score, perfects, current_streak, longest_streak, last_completed_day";

function toStats(row: PlayerRow | undefined): Stats {
  if (!row) return EMPTY_STATS;
  return {
    played: row.played,
    totalScore: row.total_score,
    perfects: row.perfects,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDay: row.last_completed_day,
  };
}

/** Today's challenge and this player's progress. A null player is brand new. */
export async function loadState(playerId: string | null): Promise<StatePayload> {
  const day = dayNumberAt(Date.now());
  const words = await getChallenge(day);
  if (!playerId) return { words, game: createGame(day), stats: EMPTY_STATS };

  const pool = await db();
  const [game, player] = await Promise.all([
    pool.query<{ rounds: RoundState[] }>(
      "SELECT rounds FROM games WHERE player_id = $1 AND day = $2",
      [playerId, day],
    ),
    pool.query<PlayerRow>(`SELECT ${PLAYER_COLUMNS} FROM players WHERE id = $1`, [playerId]),
  ]);
  return {
    words,
    game: game.rows[0] ? { day, rounds: game.rows[0].rounds } : createGame(day),
    stats: toStats(player.rows[0]),
  };
}

async function lockGame(client: PoolClient, playerId: string, day: number) {
  const found = await client.query<{ rounds: RoundState[] }>(
    "SELECT rounds FROM games WHERE player_id = $1 AND day = $2 FOR UPDATE",
    [playerId, day],
  );
  return found.rows[0]?.rounds;
}

/**
 * Applies one guess. The row locks make this safe when the same player has
 * the game open in several tabs: each guess sees the previous one's result.
 */
export async function submitGuess(
  playerId: string,
  day: number,
  round: number,
  guess: string,
): Promise<GuessResponse> {
  const today = dayNumberAt(Date.now());
  // Yesterday's game may be finished after midnight, but not started.
  if (day !== today && day !== today - 1) {
    return { result: "stale", state: await loadState(playerId) };
  }
  const words = await getChallenge(day);

  const outcome = await transaction(async (client) => {
    await client.query("INSERT INTO players (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [
      playerId,
    ]);
    if (day === today) {
      await client.query(
        "INSERT INTO games (player_id, day, rounds) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [playerId, day, JSON.stringify(createGame(day).rounds)],
      );
    }
    const rounds = await lockGame(client, playerId, day);
    if (!rounds || (day !== today && !hasStarted({ day, rounds }))) return null;

    // A tab that fell behind is guessing at a round that's already over.
    const behind = activeRoundIndex({ day, rounds }) !== round;
    const { game, result } = behind
      ? { game: { day, rounds }, result: "ignored" as const }
      : applyGuess({ day, rounds }, guess, words);
    const player = await client.query<PlayerRow>(
      `SELECT ${PLAYER_COLUMNS} FROM players WHERE id = $1 FOR UPDATE`,
      [playerId],
    );
    let stats = toStats(player.rows[0]);
    if (result === "ignored") return { result, game, stats };

    const finished = isComplete(game);
    const score = finished ? totalScore(game.rounds) : null;
    await client.query(
      `UPDATE games
          SET rounds = $3, score = $4, updated_at = now(),
              completed_at = CASE WHEN $4::integer IS NULL THEN NULL ELSE now() END
        WHERE player_id = $1 AND day = $2`,
      [playerId, day, JSON.stringify(game.rounds), score],
    );
    if (score !== null) {
      stats = recordGame(stats, day, score);
      await client.query(
        `UPDATE players
            SET played = $2, total_score = $3, perfects = $4,
                current_streak = $5, longest_streak = $6, last_completed_day = $7
          WHERE id = $1`,
        [
          playerId,
          stats.played,
          stats.totalScore,
          stats.perfects,
          stats.currentStreak,
          stats.longestStreak,
          stats.lastCompletedDay,
        ],
      );
    }
    return { result, game, stats };
  });

  if (!outcome) return { result: "stale", state: await loadState(playerId) };
  return { result: outcome.result, state: { words, game: outcome.game, stats: outcome.stats } };
}

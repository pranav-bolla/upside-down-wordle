import { db } from "./db";
import { WORD_POOLS } from "./words";

/** A word can't return until this share of its pool has been played since. */
const NO_REPEAT_SHARE = 0.8;

const cache = new Map<number, string[]>();

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Guesses are case-sensitive, so each word gets a capitalisation. */
function applyCase(word: string, roll: number): string {
  if (roll < 0.4) return word;
  if (roll < 0.7) return word[0].toUpperCase() + word.slice(1);
  return word.toUpperCase();
}

/**
 * One word per round, skipping anything played recently in that round, or
 * already hand-picked for a day coming up.
 */
export function pickWords(day: number, nearby: { day: number; words: string[] }[]): string[] {
  return WORD_POOLS.map((pool, round) => {
    const window = Math.floor(pool.length * NO_REPEAT_SHARE);
    const recent = new Set(
      nearby
        .filter((other) => other.day !== day && Math.abs(day - other.day) <= window)
        .map((other) => other.words[round]?.toLowerCase()),
    );
    const fresh = pool.filter((word) => !recent.has(word));
    const random = mulberry32(hash(`eldrow:${day}:${round}`));
    const word = fresh[Math.floor(random() * fresh.length)];
    return applyCase(word, random());
  });
}

/**
 * The three words for a challenge, identical for every player.
 *
 * Words are generated the first time a day is asked for and then stored, so
 * the table is the record of what was played. To hand-pick a day, insert its
 * row before that day starts.
 */
export async function getChallenge(day: number): Promise<string[]> {
  const cached = cache.get(day);
  if (cached) return cached;

  const pool = await db();
  const find = () =>
    pool.query<{ words: string[] }>("SELECT words FROM daily_challenges WHERE day = $1", [day]);

  let found = await find();
  if (found.rowCount === 0) {
    const longest = Math.max(...WORD_POOLS.map((words) => words.length));
    const nearby = await pool.query<{ day: number; words: string[] }>(
      "SELECT day, words FROM daily_challenges WHERE day <> $1 AND day BETWEEN $1 - $2 AND $1 + $2",
      [day, longest],
    );
    // Two instances may race here; the first insert wins and both read it back.
    await pool.query(
      "INSERT INTO daily_challenges (day, words) VALUES ($1, $2) ON CONFLICT (day) DO NOTHING",
      [day, pickWords(day, nearby.rows)],
    );
    found = await find();
  }

  const words = found.rows[0].words;
  cache.set(day, words);
  return words;
}

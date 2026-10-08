import { Pool, type PoolClient } from "pg";

const SCHEMA = `
BEGIN;
-- Serialises first-boot schema creation across instances.
SELECT pg_advisory_xact_lock(7461001);

CREATE TABLE IF NOT EXISTS daily_challenges (
  day        integer PRIMARY KEY,
  words      text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id                 uuid PRIMARY KEY,
  played             integer NOT NULL DEFAULT 0,
  total_score        integer NOT NULL DEFAULT 0,
  perfects           integer NOT NULL DEFAULT 0,
  current_streak     integer NOT NULL DEFAULT 0,
  longest_streak     integer NOT NULL DEFAULT 0,
  last_completed_day integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  player_id    uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  day          integer NOT NULL,
  rounds       jsonb NOT NULL,
  score        integer,
  completed_at timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, day)
);
COMMIT;
`;

interface Cache {
  pool?: Pool;
  ready?: Promise<void>;
}

// Survives dev hot reloads, so edits don't leak connection pools.
const cache = ((globalThis as { __eldrowDb?: Cache }).__eldrowDb ??= {});

/** The shared pool, with the schema guaranteed to exist. */
export async function db(): Promise<Pool> {
  if (!cache.pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    cache.pool = new Pool({ connectionString, max: 10 });
  }
  const pool = cache.pool;
  cache.ready ??= pool.query(SCHEMA).then(() => undefined);
  try {
    await cache.ready;
  } catch (error) {
    cache.ready = undefined;
    throw error;
  }
  return pool;
}

export async function transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await (await db()).connect();
  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

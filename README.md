# eldroW

The daily word game that's harder than it looks. (It isn't.)

Three words a day, each rotated 180°. Type what you see.

## Run it locally

Needs Node 22+ and a Postgres database.

```bash
cp .env.example .env.local   # then point DATABASE_URL at your database
npm install
npm run dev                  # http://localhost:3000
```

The tables are created automatically the first time the app talks to the database.

## Deploy on Railway

1. Create a project from this repository.
2. Add a **Postgres** database to the project.
3. On the app service, add the variable `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`.
4. Generate a domain for the service and redeploy. Link previews are built with that domain (Railway exposes it as `RAILWAY_PUBLIC_DOMAIN`). If you later use a custom domain, set `NEXT_PUBLIC_SITE_URL` to it (e.g. `https://eldrow.com`) and redeploy.

`railway.json` sets the start command and a health check at `/api/health`, which only passes once the database is reachable.

## How the daily words work

- The day number is counted in UTC from the launch date in `src/lib/config.ts`.
- The first request after midnight UTC picks that day's three words and stores them in `daily_challenges`. Every player then reads the same row. No cron job is involved.
- Words come from the pools in `src/server/words.ts`. A word can't come back in its round until roughly 80% of that pool has been played since.
- To hand-pick a day, insert its row ahead of time:

  ```sql
  INSERT INTO daily_challenges (day, words) VALUES (42, ARRAY['Cat', 'PIANO', 'umbrella']);
  ```

  Guesses ignore capitalisation, and words are always shown in lowercase.

## Data

| Table | Holds |
| --- | --- |
| `daily_challenges` | One row per day: the three words. |
| `players` | One row per anonymous player, with their statistics and streak. |
| `games` | One row per player per day: every guess, and the final score. |

Players are identified by a random id in an httpOnly cookie (`src/server/player.ts`); there are no accounts. Theme and reduced-motion preferences stay in the browser.

## Layout

- `src/lib/` — code shared by browser and server: guess rules (`game`), `scoring`, `stats`, `share`, the client `store`.
- `src/server/` — database access (`db`), word generation (`challenges`), game persistence (`games`).
- `src/app/api/` — `state` (load today's challenge and progress), `guess` (submit a guess), `health`.
- `src/components/` — UI. `Game` is the root; `GameCard` and `ResultsScreen` are the two screens.

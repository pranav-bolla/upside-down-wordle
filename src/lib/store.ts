import type { GuessRequest, GuessResponse, StatePayload } from "./api";
import { hasStarted, isComplete, normalizeGuess, type GuessResult } from "./game";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings, type Theme } from "./storage";

export interface AppState {
  status: "loading" | "error" | "ready";
  /** Words, progress and statistics from the server. Null until loaded. */
  remote: StatePayload | null;
  settings: Settings;
  /** Bumped when the game is replaced wholesale, so the board remounts. */
  version: number;
}

/** "resync" means the server's game had moved on; the board should catch up. */
export type GuessOutcome = GuessResult | "resync" | "error";

const SERVER_STATE: AppState = {
  status: "loading",
  remote: null,
  settings: DEFAULT_SETTINGS,
  version: 0,
};

const listeners = new Set<() => void>();
let state: AppState | null = null;
let loading = false;

/** "system" clears the override so the OS preference decides. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
}

function current(): AppState {
  state ??= { ...SERVER_STATE, settings: loadSettings() };
  return state;
}

function commit(next: AppState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  return (await response.json()) as T;
}

/** Replaces the game with the server's copy. Quiet failures keep what's on screen. */
async function load(quiet: boolean): Promise<void> {
  if (loading) return;
  loading = true;
  if (!quiet) commit({ ...current(), status: "loading" });
  try {
    const remote = await request<StatePayload>("/api/state");
    const before = current().remote?.game;
    const changed = JSON.stringify(before) !== JSON.stringify(remote.game);
    commit({
      ...current(),
      status: "ready",
      remote,
      version: current().version + (changed ? 1 : 0),
    });
  } catch {
    if (!current().remote) commit({ ...current(), status: "error" });
  } finally {
    loading = false;
  }
}

/** Client-side app state, shaped for useSyncExternalStore. */
export const store = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (current().status === "loading") void load(true);
    return () => listeners.delete(listener);
  },
  getSnapshot: current,
  getServerSnapshot: (): AppState => SERVER_STATE,

  retry: () => load(false),

  /** Pick up progress made in another tab or on another device. */
  refresh(): void {
    const game = current().remote?.game;
    // Never yank a half-played board out from under the player.
    if (!game || (hasStarted(game) && !isComplete(game))) return;
    void load(true);
  },

  /** Move on to today's challenge once the UTC day has rolled over. */
  startToday: () => load(true),

  async submitGuess(raw: string, round: number): Promise<GuessOutcome> {
    const game = current().remote?.game;
    if (!game || !normalizeGuess(raw)) return "ignored";
    try {
      const payload: GuessRequest = { day: game.day, round, guess: raw };
      const { result, state: remote } = await request<GuessResponse>("/api/guess", payload);
      const replaced = result === "stale";
      commit({
        ...current(),
        status: "ready",
        remote,
        version: current().version + (replaced ? 1 : 0),
      });
      return result === "stale" || result === "ignored" ? "resync" : result;
    } catch {
      return "error";
    }
  },

  updateSettings(settings: Settings): void {
    saveSettings(settings);
    applyTheme(settings.theme);
    commit({ ...current(), settings });
  },
};

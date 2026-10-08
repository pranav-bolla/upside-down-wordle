/**
 * Device preferences only. Game progress and statistics live in Postgres,
 * keyed by the player cookie.
 */
export type Theme = "system" | "light" | "dark";

export interface Settings {
  reduceMotion: boolean;
  theme: Theme;
}

export const DEFAULT_SETTINGS: Settings = { reduceMotion: false, theme: "system" };

const KEY = "worlde:settings";
const THEMES: readonly Theme[] = ["system", "light", "dark"];

export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Partial<Settings> | null;
    return {
      reduceMotion: saved?.reduceMotion === true,
      theme: THEMES.find((option) => option === saved?.theme) ?? "system",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Private mode or full storage: the choice just won't survive a reload.
  }
}

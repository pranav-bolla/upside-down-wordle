export const GAME_NAME = "eldroW";
export const TAGLINE =
  "The daily word game that's harder than it looks. (It isn't.)";

/** Challenge #001 is the UTC calendar day starting at this instant. */
export const LAUNCH_DATE_UTC = Date.UTC(2026, 9, 8);

export const ROUND_COUNT = 3;
export const MAX_GUESSES = 5;
export const MAX_SCORE = 300;

/**
 * Host shown in shared results. Set NEXT_PUBLIC_SITE_URL once the game has a
 * real domain; until then it falls back to wherever the page is being served.
 */
export function siteLabel(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.host;
  return "";
}

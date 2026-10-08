export const GAME_NAME = "eldroW";
export const TAGLINE =
  "The daily word game that's harder than it looks. (It isn't.)";

/** Challenge #001 is the UTC calendar day starting at this instant. */
export const LAUNCH_DATE_UTC = Date.UTC(2026, 9, 8);

export const ROUND_COUNT = 3;
export const MAX_GUESSES = 5;
export const MAX_SCORE = 300;

function withProtocol(url: string): string {
  return (/^https?:\/\//.test(url) ? url : `https://${url}`).replace(/\/$/, "");
}

/**
 * Full address of the game, protocol included so chat apps turn it into a
 * link. NEXT_PUBLIC_SITE_URL wins; otherwise it's wherever the page is served.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return withProtocol(configured);
  if (typeof window !== "undefined") return window.location.origin;
  return buildOrigin();
}

/** Origin known at build time, used to make link-preview image URLs absolute. */
export function buildOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.RAILWAY_PUBLIC_DOMAIN;
  return configured ? withProtocol(configured) : "http://localhost:3000";
}

import { GAME_NAME, MAX_GUESSES, MAX_SCORE, siteLabel } from "./config";
import { formatDayNumber } from "./daily";
import type { GameState } from "./game";
import { roundEmoji, totalScore } from "./scoring";

/** Spoiler-free result grid. Never contains the day's words. */
export function buildShareText(game: GameState): string {
  const score = totalScore(game.rounds);
  const rows = game.rounds.map((round) => {
    const used = round.status === "won" ? round.guesses.length : "X";
    return `${roundEmoji(round)} ${used}/${MAX_GUESSES}`;
  });
  return [
    `${GAME_NAME} #${formatDayNumber(game.day)} 🙃`,
    "",
    ...rows,
    "",
    `🧠 ${score}/${MAX_SCORE}`,
    "",
    siteLabel(),
  ].join("\n");
}

export function buildChallengeText(game: GameState): string {
  const score = totalScore(game.rounds);
  return `I just scored ${score}/${MAX_SCORE} on a game where you literally read upside-down words. Think you can beat me? 🙃 ${siteLabel()}`;
}

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure contexts.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/** Native share sheet on touch devices, clipboard everywhere else. */
export async function shareText(text: string): Promise<ShareOutcome> {
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch && typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }
  return (await copy(text)) ? "copied" : "failed";
}

import { NextResponse } from "next/server";
import { submitGuess } from "@/server/games";
import { readPlayer, rememberPlayer } from "@/server/player";

const MAX_GUESS_LENGTH = 24;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    day?: unknown;
    round?: unknown;
    guess?: unknown;
  } | null;
  const day = body?.day;
  const round = body?.round;
  const guess = body?.guess;
  if (
    typeof day !== "number" ||
    !Number.isInteger(day) ||
    typeof round !== "number" ||
    !Number.isInteger(round) ||
    typeof guess !== "string" ||
    guess.length > MAX_GUESS_LENGTH
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const player = await readPlayer();
  try {
    const outcome = await submitGuess(player.id, day, round, guess);
    return rememberPlayer(NextResponse.json(outcome), player.id);
  } catch (error) {
    console.error("POST /api/guess failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

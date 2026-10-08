import { NextResponse } from "next/server";
import { loadState } from "@/server/games";
import { readPlayer, rememberPlayer } from "@/server/player";

export async function GET() {
  // Outside the try: reading cookies is what marks this route as per-request.
  const player = await readPlayer();
  try {
    const state = await loadState(player.isNew ? null : player.id);
    return rememberPlayer(NextResponse.json(state), player.id);
  } catch (error) {
    console.error("GET /api/state failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

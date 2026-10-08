import { connection, NextResponse } from "next/server";
import { db } from "@/server/db";

/** Deploy health check: passes only when the database is reachable. */
export async function GET() {
  await connection();
  try {
    await (await db()).query("SELECT 1");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("health check failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

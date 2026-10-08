import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const COOKIE = "eldrow_player";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/**
 * Players are anonymous: an unguessable id in an httpOnly cookie. Swapping
 * this for a real session is the only change accounts would need here.
 */
export async function readPlayer(): Promise<{ id: string; isNew: boolean }> {
  const saved = (await cookies()).get(COOKIE)?.value;
  if (saved && UUID.test(saved)) return { id: saved, isNew: false };
  return { id: randomUUID(), isNew: true };
}

/** Re-set on every response so the cookie's expiry keeps sliding forward. */
export function rememberPlayer<T>(response: NextResponse<T>, id: string): NextResponse<T> {
  response.cookies.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TEN_YEARS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

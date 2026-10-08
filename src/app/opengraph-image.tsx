import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { GAME_NAME } from "@/lib/config";

export const alt = `${GAME_NAME}: a daily word game where every word is upside down`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card chat apps and social sites show when the link is shared. */
export default async function Image() {
  const geist = await readFile(join(process.cwd(), "src/app/fonts/Geist-ExtraBold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 72px 60px",
          background: "#f8f7f4",
          color: "#202020",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            color: "#5757f5",
          }}
        >
          THE DAILY WORD GAME
        </div>

        <div
          style={{
            width: "100%",
            height: 330,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            border: "2px solid #e7e4dd",
            borderRadius: 56,
            boxShadow: "0 24px 60px -24px rgba(32, 32, 32, 0.18)",
          }}
        >
          {/* Same trick as the game: the whole word is rotated 180 degrees. */}
          <div
            style={{
              display: "flex",
              fontSize: 230,
              letterSpacing: -8,
              lineHeight: 1,
              transform: "rotate(180deg)",
            }}
          >
            {GAME_NAME}
            <span style={{ color: "#5757f5" }}>.</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 38, letterSpacing: -0.5 }}>
          Three words. All upside down.
          <span style={{ color: "#77756f", marginLeft: 14 }}>Harder than it looks. (It isn’t.)</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Geist", data: geist, style: "normal", weight: 800 }],
    },
  );
}

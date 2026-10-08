import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { buildOrigin, GAME_NAME, TAGLINE } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SHARE_TITLE = `${GAME_NAME} — can you read upside down?`;

// The preview image comes from opengraph-image.tsx and twitter-image.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(buildOrigin()),
  title: `${GAME_NAME} — read the upside-down word`,
  description: TAGLINE,
  applicationName: GAME_NAME,
  openGraph: {
    title: SHARE_TITLE,
    description: TAGLINE,
    siteName: GAME_NAME,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: TAGLINE,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#121214" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Applies a saved light/dark choice before first paint, so there's no flash.
const THEME_SCRIPT = `try{var t=JSON.parse(localStorage.getItem("worlde:settings")||"{}").theme;if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}

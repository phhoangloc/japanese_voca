import type { Metadata } from "next";
import { M_PLUS_1p } from "next/font/google";
import "./globals.css";

// The whole UI is Japanese — one Google font, "M PLUS 1p", covers body and
// display use (heavier weights for headings / the wordmark). `preload: false`
// because a CJK font has no small preload subset.
const mplus = M_PLUS_1p({
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-mplus",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "用語ー図書館",
  description: "コースを本のように並べて読む図書館",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={mplus.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

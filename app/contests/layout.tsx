import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "コンテスト | SOLUNA",
  description:
    "SOLUNA music contest. Submit your track and win a slot at SOLUNA FEST HAWAII 2026.",
  openGraph: {
    title: "コンテスト | SOLUNA",
    description:
      "SOLUNA music contest. Submit your track and win a slot at SOLUNA FEST HAWAII 2026.",
    url: "https://solun.art/contests",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "コンテスト | SOLUNA",
    description:
      "SOLUNA music contest. Submit your track and win a slot at SOLUNA FEST HAWAII 2026.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "チケット | SOLUNA FEST HAWAII 2026",
  description:
    "GA・VIP・バックステージパス。2026年9月4-6日、オアフ島モアナルアガーデン。",
  openGraph: {
    title: "チケット | SOLUNA FEST HAWAII 2026",
    description:
      "GA・VIP・バックステージパス。2026年9月4-6日、オアフ島モアナルアガーデン。",
    url: "https://solun.art/tickets",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "チケット | SOLUNA FEST HAWAII 2026",
    description:
      "GA・VIP・バックステージパス。2026年9月4-6日、オアフ島モアナルアガーデン。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

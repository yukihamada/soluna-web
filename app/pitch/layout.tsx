import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pitch Deck | SOLUNA FEST HAWAII 2026",
  description:
    "Internal pitch deck. SOLUNA FEST HAWAII 2026 business plan.",
  openGraph: {
    title: "Pitch Deck | SOLUNA FEST HAWAII 2026",
    description:
      "Internal pitch deck. SOLUNA FEST HAWAII 2026 business plan.",
    url: "https://solun.art/pitch",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pitch Deck | SOLUNA FEST HAWAII 2026",
    description:
      "Internal pitch deck. SOLUNA FEST HAWAII 2026 business plan.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

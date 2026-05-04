import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist Lounge | SOLUNA FEST HAWAII 2026",
  description:
    "Artist backstage lounge for SOLUNA FEST HAWAII 2026. Token-gated access.",
  openGraph: {
    title: "Artist Lounge | SOLUNA FEST HAWAII 2026",
    description:
      "Artist backstage lounge for SOLUNA FEST HAWAII 2026. Token-gated access.",
    url: "https://solun.art/artist-lounge",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Artist Lounge | SOLUNA FEST HAWAII 2026",
    description:
      "Artist backstage lounge for SOLUNA FEST HAWAII 2026. Token-gated access.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

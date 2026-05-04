import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スポンサー | SOLUNA FEST HAWAII 2026",
  description:
    "Sponsorship opportunities for SOLUNA FEST HAWAII 2026. Reach 5,000+ premium festival-goers.",
  openGraph: {
    title: "スポンサー | SOLUNA FEST HAWAII 2026",
    description:
      "Sponsorship opportunities for SOLUNA FEST HAWAII 2026. Reach 5,000+ premium festival-goers.",
    url: "https://solun.art/sponsor",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "スポンサー | SOLUNA FEST HAWAII 2026",
    description:
      "Sponsorship opportunities for SOLUNA FEST HAWAII 2026. Reach 5,000+ premium festival-goers.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

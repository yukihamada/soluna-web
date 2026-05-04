import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Info & Access | SOLUNA FEST HAWAII 2026",
  description:
    "Venue info, access, and transportation for SOLUNA FEST HAWAII 2026.",
  openGraph: {
    title: "Info & Access | SOLUNA FEST HAWAII 2026",
    description:
      "Venue info, access, and transportation for SOLUNA FEST HAWAII 2026.",
    url: "https://solun.art/info",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Info & Access | SOLUNA FEST HAWAII 2026",
    description:
      "Venue info, access, and transportation for SOLUNA FEST HAWAII 2026.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

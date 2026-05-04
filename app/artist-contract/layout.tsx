import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist Contract | SOLUNA FEST HAWAII 2026",
  description: "Artist performance contract for SOLUNA FEST HAWAII 2026.",
  openGraph: {
    title: "Artist Contract | SOLUNA FEST HAWAII 2026",
    description: "Artist performance contract for SOLUNA FEST HAWAII 2026.",
    url: "https://solun.art/artist-contract",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Artist Contract | SOLUNA FEST HAWAII 2026",
    description: "Artist performance contract for SOLUNA FEST HAWAII 2026.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

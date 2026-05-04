import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposal | SOLUNA FEST HAWAII 2026",
  description: "SOLUNA FEST HAWAII 2026 event proposal.",
  openGraph: {
    title: "Proposal | SOLUNA FEST HAWAII 2026",
    description: "SOLUNA FEST HAWAII 2026 event proposal.",
    url: "https://solun.art/proposal",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proposal | SOLUNA FEST HAWAII 2026",
    description: "SOLUNA FEST HAWAII 2026 event proposal.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

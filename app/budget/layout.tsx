import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget | SOLUNA FEST HAWAII 2026",
  description: "Budget overview for SOLUNA FEST HAWAII 2026.",
  openGraph: {
    title: "Budget | SOLUNA FEST HAWAII 2026",
    description: "Budget overview for SOLUNA FEST HAWAII 2026.",
    url: "https://solun.art/budget",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Budget | SOLUNA FEST HAWAII 2026",
    description: "Budget overview for SOLUNA FEST HAWAII 2026.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

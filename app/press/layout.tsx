import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プレス | SOLUNA",
  description: "SOLUNA press kit and media resources.",
  openGraph: {
    title: "プレス | SOLUNA",
    description: "SOLUNA press kit and media resources.",
    url: "https://solun.art/press",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "プレス | SOLUNA",
    description: "SOLUNA press kit and media resources.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live | SOLUNA",
  description: "SOLUNA live stream and real-time festival experience.",
  openGraph: {
    title: "Live | SOLUNA",
    description: "SOLUNA live stream and real-time festival experience.",
    url: "https://solun.art/live",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live | SOLUNA",
    description: "SOLUNA live stream and real-time festival experience.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

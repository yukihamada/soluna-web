import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music | SOLUNA",
  description: "SOLUNA music platform. Drop a track, get a radio channel.",
  openGraph: {
    title: "Music | SOLUNA",
    description: "SOLUNA music platform. Drop a track, get a radio channel.",
    url: "https://solun.art/music",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music | SOLUNA",
    description: "SOLUNA music platform. Drop a track, get a radio channel.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

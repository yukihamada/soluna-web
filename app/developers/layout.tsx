import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developers | SOLUNA",
  description: "SOLUNA developer API and integration documentation.",
  openGraph: {
    title: "Developers | SOLUNA",
    description: "SOLUNA developer API and integration documentation.",
    url: "https://solun.art/developers",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developers | SOLUNA",
    description: "SOLUNA developer API and integration documentation.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

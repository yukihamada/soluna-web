import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deal | SOLUNA",
  description: "SOLUNA co-ownership deal terms and investment structure.",
  openGraph: {
    title: "Deal | SOLUNA",
    description: "SOLUNA co-ownership deal terms and investment structure.",
    url: "https://solun.art/deal",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deal | SOLUNA",
    description: "SOLUNA co-ownership deal terms and investment structure.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

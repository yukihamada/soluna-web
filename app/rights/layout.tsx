import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rights | SOLUNA",
  description: "SOLUNA music rights and licensing information.",
  openGraph: {
    title: "Rights | SOLUNA",
    description: "SOLUNA music rights and licensing information.",
    url: "https://solun.art/rights",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rights | SOLUNA",
    description: "SOLUNA music rights and licensing information.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

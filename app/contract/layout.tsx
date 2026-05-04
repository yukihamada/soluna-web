import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contract | SOLUNA FEST HAWAII 2026",
  description: "SOLUNA FEST HAWAII 2026 venue and partnership contract.",
  openGraph: {
    title: "Contract | SOLUNA FEST HAWAII 2026",
    description: "SOLUNA FEST HAWAII 2026 venue and partnership contract.",
    url: "https://solun.art/contract",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contract | SOLUNA FEST HAWAII 2026",
    description: "SOLUNA FEST HAWAII 2026 venue and partnership contract.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

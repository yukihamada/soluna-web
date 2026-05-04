import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production | SOLUNA FEST HAWAII 2026",
  description:
    "Production details and technical specifications for SOLUNA FEST HAWAII 2026.",
  openGraph: {
    title: "Production | SOLUNA FEST HAWAII 2026",
    description:
      "Production details and technical specifications for SOLUNA FEST HAWAII 2026.",
    url: "https://solun.art/production",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Production | SOLUNA FEST HAWAII 2026",
    description:
      "Production details and technical specifications for SOLUNA FEST HAWAII 2026.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

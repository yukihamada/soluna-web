import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SOLUNA FEST HAWAII 2026 — Vision",
  description:
    "Oct 31, 2026. Moanalua Gardens, Oahu. ZAMNA×SOLUNA. 300 drones, banyan tree, open-air techno.",
  openGraph: {
    title: "SOLUNA FEST HAWAII 2026 — Vision",
    description:
      "Oct 31, 2026. Moanalua Gardens, Oahu. ZAMNA×SOLUNA. 300 drones, banyan tree, open-air techno.",
    url: "https://solun.art/vision",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLUNA FEST HAWAII 2026 — Vision",
    description:
      "Oct 31, 2026. Moanalua Gardens, Oahu. ZAMNA×SOLUNA. 300 drones, banyan tree, open-air techno.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

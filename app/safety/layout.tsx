import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "安全・緊急 | SOLUNA FEST",
  description:
    "Safety and emergency information for SOLUNA FEST HAWAII 2026.",
  openGraph: {
    title: "安全・緊急 | SOLUNA FEST",
    description:
      "Safety and emergency information for SOLUNA FEST HAWAII 2026.",
    url: "https://solun.art/safety",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "安全・緊急 | SOLUNA FEST",
    description:
      "Safety and emergency information for SOLUNA FEST HAWAII 2026.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

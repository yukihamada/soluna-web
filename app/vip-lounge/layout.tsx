import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Lounge | SOLUNA FEST HAWAII 2026",
  description:
    "Exclusive VIP Lounge access for SOLUNA FEST HAWAII 2026. Token-gated entry.",
  openGraph: {
    title: "VIP Lounge | SOLUNA FEST HAWAII 2026",
    description:
      "Exclusive VIP Lounge access for SOLUNA FEST HAWAII 2026. Token-gated entry.",
    url: "https://solun.art/vip-lounge",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "VIP Lounge | SOLUNA FEST HAWAII 2026",
    description:
      "Exclusive VIP Lounge access for SOLUNA FEST HAWAII 2026. Token-gated entry.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP | SOLUNA FEST HAWAII 2026",
  description:
    "VIPラウンジ、プレミアムビュー、ミートアンドグリート。限定VIPパッケージ。",
  openGraph: {
    title: "VIP | SOLUNA FEST HAWAII 2026",
    description:
      "VIPラウンジ、プレミアムビュー、ミートアンドグリート。限定VIPパッケージ。",
    url: "https://solun.art/vip",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "VIP | SOLUNA FEST HAWAII 2026",
    description:
      "VIPラウンジ、プレミアムビュー、ミートアンドグリート。限定VIPパッケージ。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

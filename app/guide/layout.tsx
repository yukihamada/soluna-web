import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ガイド | SOLUNA",
  description: "SOLUNAメンバー向けチェックイン・施設ガイド。",
  openGraph: {
    title: "ガイド | SOLUNA",
    description: "SOLUNAメンバー向けチェックイン・施設ガイド。",
    url: "https://solun.art/guide",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ガイド | SOLUNA",
    description: "SOLUNAメンバー向けチェックイン・施設ガイド。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

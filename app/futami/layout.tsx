import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "二見 | SOLUNA",
  description: "SOLUNA 二見プロジェクト。",
  openGraph: {
    title: "二見 | SOLUNA",
    description: "SOLUNA 二見プロジェクト。",
    url: "https://solun.art/futami",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "二見 | SOLUNA",
    description: "SOLUNA 二見プロジェクト。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

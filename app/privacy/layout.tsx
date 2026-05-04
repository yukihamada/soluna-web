import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | SOLUNA",
  description: "SOLUNAのプライバシーポリシー。",
  openGraph: {
    title: "プライバシーポリシー | SOLUNA",
    description: "SOLUNAのプライバシーポリシー。",
    url: "https://solun.art/privacy",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "プライバシーポリシー | SOLUNA",
    description: "SOLUNAのプライバシーポリシー。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

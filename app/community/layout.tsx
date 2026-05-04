import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "コミュニティ | SOLUNA",
  description:
    "SOLUNAメンバーのコミュニティ。物件情報・滞在レポート・建設進捗。",
  openGraph: {
    title: "コミュニティ | SOLUNA",
    description:
      "SOLUNAメンバーのコミュニティ。物件情報・滞在レポート・建設進捗。",
    url: "https://solun.art/community",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "コミュニティ | SOLUNA",
    description:
      "SOLUNAメンバーのコミュニティ。物件情報・滞在レポート・建設進捗。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

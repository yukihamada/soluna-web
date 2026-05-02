import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SOLUNA OS — 場所を、分かち合う",
  description:
    "日本全国の空き家を、次世代の共有リゾートに変える。SOLUNAが目指すプラットフォームのかたち。",
  openGraph: {
    title: "SOLUNA OS — 場所を、分かち合う",
    description: "日本全国の空き家を、次世代の共有リゾートに変える。",
    url: "https://solun.art/os",
    type: "website",
    siteName: "SOLUNA",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

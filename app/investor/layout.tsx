import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "投資家向け情報 | SOLUNA",
  description:
    "SOLUNA investor information. Festival + resort co-ownership platform.",
  openGraph: {
    title: "投資家向け情報 | SOLUNA",
    description:
      "SOLUNA investor information. Festival + resort co-ownership platform.",
    url: "https://solun.art/investor",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "投資家向け情報 | SOLUNA",
    description:
      "SOLUNA investor information. Festival + resort co-ownership platform.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

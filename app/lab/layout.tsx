import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SOLUNA Lab — 建材研究開発",
  description:
    "菌糸体・竹・籾殻を使ったゼロエミッション建材の研究開発。試験が完了したものから販売。",
  openGraph: {
    title: "SOLUNA Lab — 建材研究開発",
    description:
      "菌糸体・竹・籾殻を使ったゼロエミッション建材の研究開発。試験が完了したものから販売。",
    url: "https://solun.art/lab",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLUNA Lab — 建材研究開発",
    description:
      "菌糸体・竹・籾殻を使ったゼロエミッション建材の研究開発。試験が完了したものから販売。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

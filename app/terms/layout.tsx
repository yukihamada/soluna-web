import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | SOLUNA",
  description: "SOLUNAの利用規約。",
  openGraph: {
    title: "利用規約 | SOLUNA",
    description: "SOLUNAの利用規約。",
    url: "https://solun.art/terms",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "利用規約 | SOLUNA",
    description: "SOLUNAの利用規約。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

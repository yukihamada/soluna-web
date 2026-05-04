import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NFT Mint | SOLUNA",
  description: "Mint your SOLUNA pass NFT on Solana.",
  openGraph: {
    title: "NFT Mint | SOLUNA",
    description: "Mint your SOLUNA pass NFT on Solana.",
    url: "https://solun.art/mint",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFT Mint | SOLUNA",
    description: "Mint your SOLUNA pass NFT on Solana.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

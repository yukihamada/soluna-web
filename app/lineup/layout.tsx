import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ラインナップ | SOLUNA FEST HAWAII 2026",
  description:
    "DJ Nobu, WhoMadeWho, Mathame and more. SOLUNA FEST HAWAII 2026 lineup.",
  openGraph: {
    title: "ラインナップ | SOLUNA FEST HAWAII 2026",
    description:
      "DJ Nobu, WhoMadeWho, Mathame and more. SOLUNA FEST HAWAII 2026 lineup.",
    url: "https://solun.art/lineup",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ラインナップ | SOLUNA FEST HAWAII 2026",
    description:
      "DJ Nobu, WhoMadeWho, Mathame and more. SOLUNA FEST HAWAII 2026 lineup.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

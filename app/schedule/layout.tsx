import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スケジュール | SOLUNA FEST HAWAII 2026",
  description: "SOLUNA FEST HAWAII 2026 full schedule.",
  openGraph: {
    title: "スケジュール | SOLUNA FEST HAWAII 2026",
    description: "SOLUNA FEST HAWAII 2026 full schedule.",
    url: "https://solun.art/schedule",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "スケジュール | SOLUNA FEST HAWAII 2026",
    description: "SOLUNA FEST HAWAII 2026 full schedule.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

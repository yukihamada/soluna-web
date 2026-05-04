import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff | SOLUNA FEST HAWAII 2026",
  description: "Staff information and resources for SOLUNA FEST HAWAII 2026.",
  openGraph: {
    title: "Staff | SOLUNA FEST HAWAII 2026",
    description:
      "Staff information and resources for SOLUNA FEST HAWAII 2026.",
    url: "https://solun.art/staff",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Staff | SOLUNA FEST HAWAII 2026",
    description:
      "Staff information and resources for SOLUNA FEST HAWAII 2026.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

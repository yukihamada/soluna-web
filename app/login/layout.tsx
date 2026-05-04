import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | SOLUNA",
  description: "SOLUNAメンバーポータル。メールOTPでログイン。",
  openGraph: {
    title: "ログイン | SOLUNA",
    description: "SOLUNAメンバーポータル。メールOTPでログイン。",
    url: "https://solun.art/login",
    type: "website",
    siteName: "SOLUNA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ログイン | SOLUNA",
    description: "SOLUNAメンバーポータル。メールOTPでログイン。",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

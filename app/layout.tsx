import type { Metadata, Viewport } from "next";
import Script from "next/script";
import SolanaProviders from "./providers";
import MacShell from "@/components/MacShell";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#080808",
};

const GA_MEASUREMENT_ID = "G-XWZTCMLK4M";

export const metadata: Metadata = {
  title: "SOLUNA — 別荘共同所有・フェス体験 | 北海道・熱海・ハワイ 780万円〜",
  description:
    "10口シェアで登記所有。北海道3万坪・熱海・ハワイの別荘を780万円から所有。使わない期間はプロが管理。ZAMNA HAWAII 2026も開催。",
  metadataBase: new URL("https://solun.art"),
  openGraph: {
    title: "SOLUNA — 別荘共同所有・フェス体験",
    description: "10口シェアで登記所有。北海道・熱海・ハワイの別荘を780万円から。ZAMNA HAWAII 2026開催。",
    type: "website",
    url: "https://solun.art",
    siteName: "SOLUNA",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLUNA — 別荘共同所有・フェス体験",
    description: "10口シェアで登記所有。北海道・熱海・ハワイの別荘を780万円から。ZAMNA HAWAII 2026開催。",
    site: "@solaborig",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SolanaProviders>
          <MacShell>
            {children}
          </MacShell>
        </SolanaProviders>
        <Script defer src="https://enabler-analytics.fly.dev/t.js" strategy="afterInteractive" />
        {/* Google Analytics 4 (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}

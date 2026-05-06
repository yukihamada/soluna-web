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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SOLUNA — 別荘共同所有・フェス体験",
    description: "10口シェアで登記所有。北海道・熱海・ハワイの別荘を780万円から。ZAMNA HAWAII 2026開催。",
    type: "website",
    url: "https://solun.art",
    siteName: "SOLUNA",
    locale: "ja_JP",
    images: [{ url: "https://solun.art/img/tapkop_real2.webp", width: 1200, height: 630, alt: "SOLUNA — 北海道3万坪のプライベート原野" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLUNA — 別荘共同所有・フェス体験",
    description: "10口シェアで登記所有。北海道・熱海・ハワイの別荘を780万円から。ZAMNA HAWAII 2026開催。",
    site: "@solaborig",
    images: ["https://solun.art/img/tapkop_real2.webp"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://solun.art/#website",
                  url: "https://solun.art/",
                  name: "SOLUNA",
                  description:
                    "定額型別荘所有プラットフォーム — 北海道・熱海・ハワイ",
                  inLanguage: "ja-JP",
                },
                {
                  "@type": "Organization",
                  "@id": "https://solun.art/#organization",
                  name: "SOLUNA",
                  url: "https://solun.art/",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://solun.art/img/tapkop_real2.webp",
                  },
                  description:
                    "土地と建築と運営を一体で設計する定額型別荘所有プラットフォーム。北海道3万坪・熱海・ハワイ。1口780万円〜、年間30泊の滞在権つき共有持分所有。",
                  foundingDate: "2020",
                  areaServed: ["JP", "US"],
                  email: "info@solun.art",
                  parentOrganization: {
                    "@type": "Organization",
                    name: "Enabler Inc.",
                    email: "info@solun.art",
                  },
                },
              ],
            }),
          }}
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

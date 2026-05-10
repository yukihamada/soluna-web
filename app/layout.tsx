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
  title: "SOLUNA — 建築でつなぐ、暮らしと地域とよろこびのコミュニティ",
  description:
    "建築を軸に、空き家再生・地域活性・ウェルネスリトリート・フェス・柔術コミュニティを 1 つのストーリーでつなぐプロジェクト。北海道弟子屈・熱海・瀬戸内・ハワイ。1 口 50 万円から仲間と所有して、年 30 泊滞在。ZAMNA HAWAII 2026 開催。",
  metadataBase: new URL("https://solun.art"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SOLUNA — 建築でつなぐ、暮らしと地域とよろこびのコミュニティ",
    description: "空き家再生・新築・ウェルネス・フェス・柔術 — ぜんぶを 1 つの建築軸でつなぐ場所。北海道・熱海・瀬戸内・ハワイで仲間と所有。",
    type: "website",
    url: "https://solun.art",
    siteName: "SOLUNA",
    locale: "ja_JP",
    images: [{ url: "https://solun.art/img/tapkop_real2.webp", width: 1200, height: 630, alt: "SOLUNA — 建築でつなぐコミュニティ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLUNA — 建築でつなぐ、暮らしと地域とよろこびのコミュニティ",
    description: "空き家再生・新築・ウェルネス・フェス・柔術。ぜんぶを 1 つの建築軸でつなぐ。",
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
                    "建築でつなぐ、暮らしと地域とよろこびのコミュニティ。空き家再生・新築・ウェルネス・フェス・柔術を 1 つの建築軸でつなぐ。",
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
                    "建築を軸に地域と人をつなぐコミュニティプロジェクト。空き家再生・新築 SIPs キャビン・ウェルネスリトリート・フェス運営・柔術道場を 1 つの世界観で繋ぐ。北海道弟子屈・熱海・瀬戸内・和歌山・ハワイ。1 口 50 万円から仲間と所有、年 30 泊滞在。",
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

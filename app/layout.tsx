import type { Metadata, Viewport } from "next";
import Script from "next/script";
import SolanaProviders from "./providers";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#080808",
};

const GA_MEASUREMENT_ID = "G-XWZTCMLK4M";

export const metadata: Metadata = {
  title: "ZAMNA HAWAII 2026 — Sep 4–5, Oahu | Powered by SOLUNA",
  description:
    "ZAMNA HAWAII — World-class underground electronic music comes to Hawaii. September 4–5, 2026, Oahu. Tickets from $120.",
  metadataBase: new URL("https://solun.art"),
  openGraph: {
    title: "ZAMNA HAWAII 2026 — Sep 4–5, Oahu",
    description: "World-class underground electronic music comes to Hawaii. Sep 4–5, 2026 · Tickets from $120 · VIP from $1,000",
    type: "website",
    url: "https://solun.art",
    siteName: "ZAMNA HAWAII",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAMNA HAWAII 2026 — Sep 4–5, Oahu",
    description: "World-class underground electronic music comes to Hawaii. Sep 4–5, 2026 · Tickets from $120",
    site: "@zamnaofficial",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
        {children}
        </SolanaProviders>
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

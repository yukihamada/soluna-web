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
  title: "SOLUNA — Festival Experience Platform | SOLUNA FEST HAWAII 2026",
  description:
    "Drop a track, get a radio channel. Vote for the next headliner. SOLUNA FEST HAWAII — Sep 4–6, 2026, Oahu.",
  metadataBase: new URL("https://solun.art"),
  openGraph: {
    title: "SOLUNA — Festival Experience Platform",
    description: "Drop a track, get a radio channel. Vote for the next headliner. SOLUNA FEST HAWAII Sep 4–6, 2026.",
    type: "website",
    url: "https://solun.art",
    siteName: "SOLUNA",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLUNA — Festival Experience Platform",
    description: "Drop a track, get a radio channel. Vote for the next headliner. SOLUNA FEST HAWAII Sep 4–6, 2026.",
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

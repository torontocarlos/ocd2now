import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter_Tight } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ocd2now.inwardexpedition.ca"),
  title: "OCD2Now",
  description: "From the loop, back to here.",
  manifest: "/manifest.json",
  applicationName: "Now",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    // apple-touch-icon is auto-served from app/apple-icon.tsx.
  },
  appleWebApp: {
    capable: true,
    title: "Now",
    statusBarStyle: "default",
  },
  // Discreet share identity. The page <title> stays "OCD2Now" for browser
  // tab honesty, but Messenger/iMessage/WhatsApp link previews show the
  // gentler "Now" — so a recipient seeing the preview in a thread isn't
  // outed. Open Graph image is generated dynamically by app/opengraph-image.tsx.
  openGraph: {
    title: "Now",
    description: "From the loop, back to here.",
    siteName: "Now",
    type: "website",
    locale: "en_CA",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Now",
    description: "From the loop, back to here.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F0E8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

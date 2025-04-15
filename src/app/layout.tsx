import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import clsx from "clsx";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Kline",
  description: "A real-time cryptocurrency trading view application",
  manifest: "/manifest.json",
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
  ],
  themeColor: "#1E1E1E",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Crypto Kline",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(geistSans.variable, geistMono.variable, "antialiased")}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

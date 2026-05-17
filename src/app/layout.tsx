import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { AppShell } from "@/components/layout/app-shell";
import { SwRegister } from "@/components/providers/sw-register";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { InstallPrompt } from "@/components/layout/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Songbook — Worship Chord Sheets",
  description: "Offline-first chord sheets and setlists for worship musicians",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Songbook",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className={`${geistSans.className} min-h-full flex flex-col font-sans`}>
        <AppProvider>
          <SwRegister />
          <OfflineBanner />
          <InstallPrompt />
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}

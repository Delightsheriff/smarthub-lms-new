import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { auth } from "@/auth";
import { AppProviders } from "@/components/providers/app-providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "SmartHub",
    template: "%s · SmartHub",
  },
  description: "SmartHub — modern learning, made simple.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched server-side so `SessionProvider` mounts client-side with
  // the real session already known — without this, `useSession()`
  // starts in a "loading" state on every fresh load and any gate that
  // doesn't explicitly wait for it (see AppShell) flashes to /login.
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}

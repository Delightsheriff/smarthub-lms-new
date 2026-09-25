import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

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

// Editorial display face (see plans/015-editorial-design-sync.md). Used
// only via the `font-display` utility on narrative surfaces (course
// pages, dashboard hero, certificates) — dense operator surfaces (nav,
// tables, forms) keep Inter. Wonk/opsz axes let headline sizes carry
// character while sub-headings stay sober; dialled in per-size via the
// `.font-display` variation-settings rule in globals.css.
const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
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
    { media: "(prefers-color-scheme: light)", color: "#430330" },
    { media: "(prefers-color-scheme: dark)", color: "#a51d81" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
      className={`${fontSans.variable} ${jetbrainsMono.variable} ${fontDisplay.variable} antialiased`}
    >
      <body>
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}

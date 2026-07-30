import type { Metadata, Viewport } from "next";
import { SketchFilters } from "@/components/ui/SketchFilters";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUPPORT BLOOM CLUB",
  description: "Join SUPPORT BLOOM CLUB — claim your bloom supporter seal.",
  icons: {
    icon: "/assets/seals/supporter-seal.png",
    apple: "/assets/seals/supporter-seal.png",
  },
};

/** Needed so env(safe-area-inset-*) resolves on notched iOS. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. mobile_mode) inject
    // classes onto <html>/<body> before hydrate — not an app bug.
    <html lang="zh-CN" className="h-full overflow-hidden" suppressHydrationWarning>
      <head>
        {/* Local @font-face CSS (public/fonts) — not Next font loader */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>

      <body className="flex h-[100dvh] flex-col overflow-hidden" suppressHydrationWarning>
        <SketchFilters />
        {children}
      </body>
    </html>
  );
}

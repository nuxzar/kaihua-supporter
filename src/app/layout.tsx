import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SketchFilters } from "@/components/ui/SketchFilters";
import { SHARE, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SHARE.title,
    template: `%s · ${SHARE.siteName}`,
  },
  description: SHARE.description,
  applicationName: SHARE.siteName,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SHARE.siteName,
    title: SHARE.title,
    description: SHARE.description,
    images: [
      {
        url: SHARE.ogImagePath,
        width: SHARE.ogImageWidth,
        height: SHARE.ogImageHeight,
        alt: SHARE.ogImageAlt,
        type: "image/jpeg",
      },
    ],
  },
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
        <Script
          id="LA_COLLECT"
          src="//sdk.51.la/js-sdk-pro.min.js"
          strategy="beforeInteractive"
          charSet="UTF-8"
        />
        <Script id="LA_INIT" strategy="afterInteractive">
          {`LA.init({id:"3Qjcn9oz8Y2cOMcT",ck:"3Qjcn9oz8Y2cOMcT"})`}
        </Script>
      </head>
      <body className="flex h-[100dvh] flex-col overflow-hidden" suppressHydrationWarning>
        <SketchFilters />
        {children}
      </body>
    </html>
  );
}

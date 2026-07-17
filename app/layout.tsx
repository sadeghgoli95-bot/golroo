import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/Seo/JsonLd";
import PersianTextNormalizer from "@/components/PersianTextNormalizer";

const vazir = localFont({
  src: [
    {
      path: "../public/fonts/Vazirmatn-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://golroo.ir"),
  title: {
    default: "گل‌رو",
    template: "%s | گل‌رو",
  },
  description:
    "برند شخصی صادق گل‌رو؛ روان‌درمانگر کودک و نوجوان. جلسات آنلاین برای کودکان، نوجوانان و والدین.",
  keywords: [
    "گل‌رو",
    "صادق گل‌رو",
    "روان‌درمانگر کودک",
    "روانشناس کودک",
    "روان‌درمانی کودک",
    "روان‌درمانی نوجوان",
    "والدین",
    "جلسات آنلاین",
  ],
  authors: [{ name: "Sadegh Golroo" }],
  creator: "Sadegh Golroo",
  publisher: "Golroo",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "گل‌رو",
    description:
      "روان‌درمانی کودک و نوجوان با تمرکز بر رابطه، رشد و فهم تجربه کودک.",
    url: "https://golroo.ir",
    siteName: "Golroo",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "گل‌رو",
    description: "روان‌درمانی کودک و نوجوان",
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={vazir.className}>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <PersianTextNormalizer />
        {children}
      </body>
    </html>
  );
}
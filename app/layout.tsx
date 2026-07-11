import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={vazir.className}>{children}</body>
    </html>
  );
}

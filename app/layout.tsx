import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "گل‌رو | روان‌درمانگری کودک و نوجوان",
  description: "صادق گل‌رو، روان‌درمانگر کودک و نوجوان در حوزه سنی صفر تا دوازده سال.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JournalGrid from "@/components/Journal/JournalGrid";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ژورنال",
  description:
    "مشاهده‌ها و یادداشت‌های بالینی درباره روان‌درمانی کودک و نوجوان، دلبستگی و رابطه والد و کودک.",
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "ژورنال | گل‌رو",
    description:
      "مشاهده‌ها و یادداشت‌های بالینی درباره روان‌درمانی کودک و نوجوان، دلبستگی و رابطه والد و کودک.",
    url: `${SITE_URL}/journal`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ژورنال | گل‌رو",
    description:
      "مشاهده‌ها و یادداشت‌های بالینی درباره روان‌درمانی کودک و نوجوان، دلبستگی و رابطه والد و کودک.",
  },
};

export default function Journal() {
  return (
    <>
      <Navbar />
      <main>
        <section className="editorial-space">
          <div className="container">
            <p className="overline">THERAPEUTIC JOURNAL</p>
            <h1 className="display">مشاهده‌هایی از اتاق درمان</h1>
            <p className="lead">
              این نوشته‌ها آموزش نیستند؛
              دعوتی هستند برای مکث و مشاهده.
            </p>
          </div>
        </section>
        <section>
          <div className="container">
            <JournalGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

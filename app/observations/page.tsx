import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ObservationGrid from "@/components/Observation/ObservationGrid";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "مشاهده‌ها",
  description: "مشاهده‌هایی که از دل اتاق درمان آمده‌اند؛ نه نسخه درمان، تمرین نگاه کردن.",
  alternates: { canonical: "/observations" },
  openGraph: {
    title: "مشاهده‌ها | گل‌رو",
    description: "مشاهده‌هایی که از دل اتاق درمان آمده‌اند؛ نه نسخه درمان، تمرین نگاه کردن.",
    url: `${SITE_URL}/observations`,
    type: "website",
  },
};

export default function Observations() {
  return (
    <>
      <Navbar />
      <main>
        <section className="editorial-space">
          <div className="container">
            <p className="overline">OBSERVATIONS</p>
            <h1 className="display">
              مشاهده‌هایی که
              از دل اتاق درمان آمده‌اند.
            </h1>
            <p className="lead">
              این‌ها نسخه درمان نیستند.
              تمرین نگاه کردن‌اند.
            </p>
          </div>
        </section>
        <section>
          <div className="container">
            <ObservationGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

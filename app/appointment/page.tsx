import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppointmentForm from "@/components/Appointment/AppointmentForm";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "درخواست جلسه روان‌درمانی",
  description:
    "اگر مایل به شروع روان‌درمانی هستید، فرم درخواست جلسه را تکمیل کنید تا در اولین فرصت با شما تماس گرفته شود.",
  alternates: { canonical: "/appointment" },
  openGraph: {
    title: "درخواست جلسه روان‌درمانی | گل‌رو",
    description:
      "اگر مایل به شروع روان‌درمانی هستید، فرم درخواست جلسه را تکمیل کنید تا در اولین فرصت با شما تماس گرفته شود.",
    url: `${siteConfig.url}/appointment`,
    type: "website",
  },
};

export default function AppointmentPage() {
  return (
    <>
      <Navbar />
      <main dir="rtl">
        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 820 }}>
            <p className="overline">APPOINTMENT</p>
            <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)" }}>
              درخواست جلسه روان‌درمانی
            </h1>
            <p className="lead">
              اگر مایل به شروع روان‌درمانی هستید، فرم زیر را تکمیل کنید. پس از بررسی، در اولین
              فرصت برای هماهنگی جلسه با شما تماس گرفته خواهد شد.
            </p>
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 820 }}>
            <AppointmentForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

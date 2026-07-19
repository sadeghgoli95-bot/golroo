import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/Contact/ContactForm";
import {
  WhatsappIcon,
  TelegramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  InfoIcon,
} from "@/components/Contact/icons";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "درخواست جلسه",
  description:
    "برای هماهنگی جلسه حضوری یا آنلاین با صادق گل‌رو، روان‌درمانگر کودک و نوجوان، درخواست خود را ثبت کنید.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "درخواست جلسه | گل‌رو",
    description:
      "برای هماهنگی جلسه حضوری یا آنلاین با صادق گل‌رو، روان‌درمانگر کودک و نوجوان، درخواست خود را ثبت کنید.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "درخواست جلسه | گل‌رو",
    description:
      "برای هماهنگی جلسه حضوری یا آنلاین با صادق گل‌رو، روان‌درمانگر کودک و نوجوان، درخواست خود را ثبت کنید.",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main dir="rtl">
        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 900 }}>
            <p className="overline">CONTACT</p>
            <h1 className="display">درخواست جلسه</h1>
            <p className="lead">
              اگر فکر می‌کنید زمان آن رسیده که درباره تجربه خود بیشتر فکر کنید، می‌توانید برای
              جلسه حضوری یا آنلاین درخواست ثبت کنید.
            </p>
          </div>
        </section>

        {/* جلسات آنلاین */}
        <section className="section-sm">
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="stack-lg">
              <div className="stack" style={{ gap: "1rem" }}>
                <h2 className="headline" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
                  جلسات آنلاین
                </h2>
                <p className="body-lg" style={{ color: "var(--muted)" }}>
                  برای مراجعان داخل و خارج از ایران، امکان برگزاری جلسات آنلاین فراهم است.
                </p>
              </div>

              <div className="grid-3">
                <div className="contact-channel">
                  <span className="contact-channel-icon">
                    <WhatsappIcon />
                  </span>
                  <p className="card-title" style={{ fontSize: "1.3rem" }}>
                    واتساپ
                  </p>
                  <a
                    href="https://wa.me/989120538112"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-primary"
                  >
                    ارسال پیام در واتساپ
                  </a>
                </div>

                <div className="contact-channel">
                  <span className="contact-channel-icon">
                    <TelegramIcon />
                  </span>
                  <p className="card-title" style={{ fontSize: "1.3rem" }}>
                    تلگرام
                  </p>
                  <a
                    href="https://t.me/SadeghGolroo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-primary"
                  >
                    پیام در تلگرام
                  </a>
                </div>

                <div className="contact-channel">
                  <span className="contact-channel-icon">
                    <MailIcon />
                  </span>
                  <p className="card-title" style={{ fontSize: "1.3rem" }}>
                    ایمیل
                  </p>
                  <a href="mailto:sadeghgoli95@gmail.com" className="button button-primary">
                    ارسال ایمیل
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container" style={{ maxWidth: 900 }}>
          <div className="rule" />
        </div>

        {/* جلسات حضوری */}
        <section className="section-sm">
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="stack-lg">
              <div className="stack" style={{ gap: "1rem" }}>
                <h2 className="headline" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
                  جلسات حضوری
                </h2>
                <p className="body-lg" style={{ color: "var(--muted)" }}>
                  جلسات حضوری با تعیین وقت قبلی انجام می‌شود.
                </p>
              </div>

              <div className="stack">
                <address className="contact-info-row" style={{ fontStyle: "normal" }}>
                  <PinIcon />
                  <span>
                    تهران، پاسداران، خیابان بوستان دوم، خیابان گیلان غربی، بین فرخی یزدی و داوود
                    اسلامی، نبش موحد ۲، پلاک ۵
                  </span>
                </address>

                <div className="contact-info-row">
                  <PhoneIcon />
                  <span className="stack" style={{ gap: ".5rem" }}>
                    <a href="tel:+982122849351">۰۲۱-۲۲۸۴۹۳۵۱</a>
                    <a href="tel:+989307070617">۰۹۳۰-۷۰۷۰۶۱۷</a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container" style={{ maxWidth: 900 }}>
          <div className="rule" />
        </div>

        {/* فرم درخواست جلسه */}
        <section className="section-sm">
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="stack-lg">
              <div className="stack" style={{ gap: "1rem" }}>
                <h2 className="headline" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
                  فرم درخواست جلسه
                </h2>
                <p className="body-lg" style={{ color: "var(--muted)" }}>
                  اطلاعات زیر را تکمیل کنید تا پس از بررسی، برای هماهنگی با شما تماس گرفته شود.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* یادداشت مهم */}
        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="contact-note">
              <InfoIcon />
              <div className="stack" style={{ gap: ".8rem" }}>
                <p style={{ color: "var(--primary)", fontWeight: 500 }}>پیش از درخواست جلسه</p>
                <p style={{ color: "var(--text)", lineHeight: 1.9 }}>
                  جلسات درمانی تنها پس از هماهنگی و تعیین وقت برگزار می‌شوند. ارسال فرم یا پیام به
                  معنای رزرو قطعی جلسه نیست و پس از بررسی، برای هماهنگی با شما تماس گرفته خواهد
                  شد.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

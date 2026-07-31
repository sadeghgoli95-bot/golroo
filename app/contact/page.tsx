import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  WhatsappIcon,
  TelegramIcon,
  MailIcon,
  InstagramIcon,
  PinIcon,
  PhoneIcon,
} from "@/components/Contact/icons";
import { siteConfig } from "@/lib/siteConfig";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "راه‌های ارتباطی",
  description:
    "راه‌های ارتباط با صادق گل‌رو، روان‌درمانگر کودک و نوجوان — واتساپ، تلگرام، ایمیل و اینستاگرام.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "راه‌های ارتباطی | گل‌رو",
    description:
      "راه‌های ارتباط با صادق گل‌رو، روان‌درمانگر کودک و نوجوان — واتساپ، تلگرام، ایمیل و اینستاگرام.",
    url: `${SITE_URL}/contact`,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "راه‌های ارتباطی | گل‌رو",
    description:
      "راه‌های ارتباط با صادق گل‌رو، روان‌درمانگر کودک و نوجوان — واتساپ، تلگرام، ایمیل و اینستاگرام.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const channels = [
  {
    href: siteConfig.contact.whatsapp,
    label: "واتساپ",
    note: "سریع‌ترین راه برای هماهنگی و پاسخ‌گویی",
    Icon: WhatsappIcon,
  },
  {
    href: siteConfig.contact.telegram,
    label: "تلگرام",
    note: "برای پیام و پرسش‌های کوتاه",
    Icon: TelegramIcon,
  },
  {
    href: `mailto:${siteConfig.contact.email}`,
    label: "ایمیل",
    note: "برای مکاتبات رسمی‌تر",
    Icon: MailIcon,
  },
  {
    href: siteConfig.contact.instagram,
    label: "اینستاگرام",
    note: "یادداشت‌ها و مطالب کوتاه‌تر",
    Icon: InstagramIcon,
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main dir="rtl">
        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 900 }}>
            <p className="overline">CONTACT</p>
            <h1 className="display" style={{ color: "var(--primary)" }}>
              راه‌های ارتباطی
            </h1>
            <p className="lead">
              برای مراجعان داخل و خارج از ایران، امکان برگزاری جلسات آنلاین و حضوری فراهم است. برای
              پیام یا سوال سریع از راه‌های زیر استفاده کنید.
            </p>
          </div>
        </section>

        {/* کانال‌های ارتباطی */}
        <section className="section-sm" style={{ background: "var(--bg-soft)" }}>
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="grid-4">
              {channels.map(({ href, label, note, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className="contact-channel"
                >
                  <span className="contact-channel-icon">
                    <Icon />
                  </span>
                  <p className="card-title" style={{ fontSize: "1.15rem", marginBottom: 0 }}>
                    {label}
                  </p>
                  <p className="caption">{note}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="container" style={{ maxWidth: 900 }}>
          <div className="rule" />
        </div>

        {/* جلسات حضوری / آنلاین */}
        <section className="section-sm">
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="grid-2">
              <div className="stack" style={{ gap: "1.4rem" }}>
                <h2 className="headline" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--primary)" }}>
                  جلسات حضوری
                </h2>
                <address className="contact-info-row" style={{ fontStyle: "normal" }}>
                  <PinIcon />
                  <span>{siteConfig.contact.address}</span>
                </address>
                <div className="contact-info-row">
                  <PhoneIcon />
                  <span className="stack" style={{ gap: ".5rem" }}>
                    {siteConfig.contact.phones.map((phone) => (
                      <a key={phone} href={`tel:${phone}`}>
                        {phone}
                      </a>
                    ))}
                  </span>
                </div>
              </div>

              <div className="stack" style={{ gap: "1.4rem" }}>
                <h2 className="headline" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--primary)" }}>
                  جلسات آنلاین
                </h2>
                <p className="body-lg" style={{ color: "var(--muted)" }}>
                  برای مراجعان داخل و خارج از ایران، امکان برگزاری جلسات آنلاین فراهم است؛ زمان و
                  بستر جلسه پس از هماهنگی مشخص می‌شود.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA نهایی */}
        <section className="section-sm">
          <div className="container" style={{ maxWidth: 900 }}>
            <div
              style={{
                background: "var(--primary)",
                color: "#fff",
                borderRadius: "var(--radius-card)",
                padding: "3.5rem 3rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "2rem",
              }}
            >
              <div>
                <p style={{ fontSize: "1.2rem", marginBottom: ".6rem" }}>
                  برای هماهنگی جلسه، فرم رزرو را تکمیل کنید.
                </p>
                <p style={{ color: "rgba(255,255,255,.75)", lineHeight: 1.9, maxWidth: "48ch" }}>
                  ارسال فرم به معنای رزرو قطعی جلسه نیست؛ پس از بررسی با شما تماس گرفته می‌شود.
                </p>
              </div>
              <Link
                href="/appointment"
                style={{
                  background: "#fff",
                  color: "var(--primary)",
                  padding: "1rem 2rem",
                  borderRadius: "var(--radius-pill)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                رزرو جلسه
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

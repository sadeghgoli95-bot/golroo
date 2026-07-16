import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqAccordionList from "@/components/Faq/FaqAccordionList";
import { JsonLd, faqPageJsonLd } from "@/components/Seo/JsonLd";
import { client } from "@/sanity/lib/client";
import { publishedFaqsQuery } from "@/sanity/lib/queries";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description:
    "پاسخ به پرسش‌هایی که معمولاً پیش از شروع روان‌درمانی، رزرو جلسه یا آشنایی با روند درمان مطرح می‌شوند.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "پرسش‌های متداول | گل‌رو",
    description:
      "پاسخ به پرسش‌هایی که معمولاً پیش از شروع روان‌درمانی، رزرو جلسه یا آشنایی با روند درمان مطرح می‌شوند.",
    url: `${siteConfig.url}/faq`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "پرسش‌های متداول | گل‌رو",
  },
};

export default async function FaqPage() {
  const faqs = await client.fetch(publishedFaqsQuery);

  return (
    <>
      <Navbar />
      <main dir="rtl">
        {faqs.length > 0 && (
          <JsonLd
            data={faqPageJsonLd(
              faqs.map((faq: { question: string; answer: string }) => ({
                question: faq.question,
                answer: faq.answer,
              }))
            )}
          />
        )}

        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 820 }}>
            <p className="overline">FAQ</p>
            <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)" }}>
              پرسش‌های متداول
            </h1>
            <p className="lead">
              پاسخ به پرسش‌هایی که معمولاً پیش از شروع روان‌درمانی، رزرو جلسه یا آشنایی با روند
              درمان مطرح می‌شوند.
            </p>
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 820 }}>
            <FaqAccordionList faqs={faqs} />
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="contact-note" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
              <p style={{ color: "var(--text)", fontSize: "1.1rem" }}>
                هنوز پاسخ پرسش خود را پیدا نکرده‌اید؟
              </p>
              <div className="cluster" style={{ gap: "1rem" }}>
                <Link href="/contact" className="button button-primary">
                  درخواست جلسه
                </Link>
                <Link href="/contact" className="button button-secondary">
                  تماس با من
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

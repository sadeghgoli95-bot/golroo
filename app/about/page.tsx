import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Story from "@/components/Story";
import Observation from "@/components/Observation";
import QuoteBlock from "@/components/QuoteBlock";
import Thinking from "@/components/Thinking";
import Manifesto from "@/components/Manifesto";
import ReadingPause from "@/components/ReadingPause";
import Services from "@/components/Services";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "درباره",
  description:
    "محمد صادق گل‌رو، روان‌شناس و روان‌درمانگر کودک و نوجوان؛ رویکردی رابطه‌محور، روان‌پویشی و مبتنی بر مشاهده.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "درباره | گل‌رو",
    description:
      "محمد صادق گل‌رو، روان‌شناس و روان‌درمانگر کودک و نوجوان؛ رویکردی رابطه‌محور، روان‌پویشی و مبتنی بر مشاهده.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "درباره | گل‌رو",
    description:
      "محمد صادق گل‌رو، روان‌شناس و روان‌درمانگر کودک و نوجوان؛ رویکردی رابطه‌محور، روان‌پویشی و مبتنی بر مشاهده.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="editorial-space">
          <div className="container" style={{ maxWidth: "860px" }}>
            <p className="overline">ABOUT</p>

            <h1 className="display">
              درباره
            </h1>

            <p className="lead">
              هر کودکی که وارد اتاق درمان می‌شود، تنها مجموعه‌ای از رفتارها یا
              نشانه‌ها نیست. پشت هر تجربه، تاریخی از رابطه‌ها، هیجان‌ها و تلاش
              برای سازگار شدن با جهان وجود دارد.
            </p>

            <nav className="about-toc" aria-label="پرش به بخش‌ها">
              <a href="#about-approach">نگاه من</a>
              <a href="#about-method">رویکرد درمانی</a>
              <a href="#about-bio">درباره من</a>
              <a href="#about-values">ارزش‌ها</a>
              <a href="#about-services">خدمات</a>
            </nav>
          </div>
        </section>

        <section id="about-approach" className="section section-compact">
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ color: "var(--primary)" }}>نگاه من به روان‌درمانی</h2>

            <div style={{ display: "grid", gap: 28, marginTop: 32, lineHeight: 2.2, fontSize: "1.1rem" }}>
              <p>
                در روان‌درمانی، هدف من پیش از هر چیز نزدیک شدن به تجربه‌ای است
                که کودک یا نوجوان در حال زندگی کردن آن است؛ نه یافتن سریع‌ترین
                راه برای تغییر یک رفتار.
              </p>

              <p>
                رفتار کودک اغلب راهی است که او برای بیان چیزی پیدا کرده که هنوز
                نمی‌تواند آن را با کلمات بگوید. نادیده گرفتن این معنا، به قیمت
                از دست دادن بخش مهمی از تصویر تمام می‌شود.
              </p>

              <p>
                این نگاه به معنای بی‌اهمیت دانستن تغییر رفتار نیست؛ بلکه به این
                معناست که تغییر پایدارتر زمانی اتفاق می‌افتد که ابتدا فهمیده
                شود رفتار در چه زمینه‌ای شکل گرفته است.
              </p>
            </div>
          </div>
        </section>

        <Story />
        <Observation />

        <section id="about-method" className="section section-compact">
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ color: "var(--primary)" }}>رویکرد درمانی</h2>

            <div style={{ display: "grid", gap: 28, marginTop: 32, lineHeight: 2.2, fontSize: "1.1rem" }}>
              <p>
                رویکرد من در کار بالینی از نگاه روان‌پویشی، نظریه دلبستگی و
                تفکر رابطه‌ای شکل گرفته است.
              </p>

              <p>
                این چارچوب‌ها را ابزارهایی برای دیدن دقیق‌تر تجربه انسان
                می‌دانم، نه هویتی که باید به آن پایبند ماند. هیچ نظریه‌ای
                به‌تنهایی نمی‌تواند یک انسان را کامل توضیح دهد؛ آنچه اهمیت
                دارد، توجه به تجربه مشخص همان کودک یا همان خانواده است، فراتر
                از هر چارچوب نظری.
              </p>

              <p>
                پایبندی من، پیش از هر چیز، به دقت در فهم همین تجربه است.
              </p>
            </div>
          </div>
        </section>

        <QuoteBlock quote="لازم نیست مطمئن باشید که مشکلی وجود دارد. اگر چیزی در رفتار، احساس یا رابطه با فرزندتان ذهن شما را مشغول کرده است، همان نگرانی می‌تواند نقطه مناسبی برای آغاز یک گفت‌وگو باشد." />
        <Thinking />

        <section id="about-bio" className="section section-compact" style={{ background: "#FBFAF9" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ color: "var(--primary)" }}>درباره من</h2>

            <div className="about-bio-text">
              <p>
                من محمد صادق گل‌رو فارغ‌التحصیل روان‌شناسی تربیتی از دانشگاه
                علامه طباطبایی هستم.
              </p>

              <p>
                من هم‌اکنون به‌عنوان ارزیاب و روان‌شناس تخصصی کودک و نوجوان در
                کلینیک روان‌پویشی آگاه تهران فعالیت می‌کنم.
              </p>
            </div>
          </div>
        </section>

        <Manifesto />
        <ReadingPause text="شخصیت کودک، فقط با آنچه برایش اتفاق می‌افتد شکل نمی‌گیرد؛ با تجربهٔ فهمیده شدن و فهمیده نشدن نیز شکل می‌گیرد." />

        <section className="section section-compact" style={{ background: "var(--bg-soft)" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ color: "var(--primary)" }}>در این سایت چه خواهید خواند؟</h2>

            <div style={{ display: "grid", gap: 28, marginTop: 32, lineHeight: 2.2, fontSize: "1.1rem" }}>
              <p>
                نوشته‌های این سایت به‌جای ارائه نسخه آماده یا توصیه سریع،
                تلاشی‌اند برای دیدن دقیق‌تر یک پدیده انسانی؛ نه اثبات یک نظریه،
                نه ارائه پاسخی نهایی.
              </p>

              <p>
                اگر پس از خواندن یک نوشته، تجربه‌ای آشنا را از زاویه‌ای تازه
                دیده باشید یا پرسشی جدید برایتان شکل گرفته باشد، آن نوشته به
                هدف خود رسیده است.
              </p>
            </div>
          </div>
        </section>

        <section id="about-values" className="section section-compact">
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ marginBottom: 8, color: "var(--primary)" }}>ارزش‌هایی که به آن‌ها پایبندم</h2>

            <div className="about-values-grid">
              {[
                "کنجکاوی به جای قضاوت",
                "فهم به جای نصیحت",
                "مسئولیت به جای سرزنش",
                "پیچیدگی به جای ساده‌سازی",
                "رابطه به جای فردگرایی افراطی",
                "فروتنی معرفتی به جای قطعیت",
              ].map((value, i) => (
                <div className="about-value-card" key={value}>
                  <span className="about-value-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="about-value-text">{value}</span>
                </div>
              ))}
            </div>

            <blockquote className="pull-quote" style={{ marginTop: "3.5rem" }}>
              ذهن انسان مسئله‌ای نیست که حل شود؛
              <br />
              تجربه‌ای است که باید با دقت، کنجکاوی و احترام به آن نزدیک شد.
            </blockquote>
          </div>
        </section>

        <div id="about-services">
          <Services />
        </div>

        <section className="section-sm">
          <div className="container" style={{ maxWidth: 760 }}>
            <Link href="/journal" className="btn-text">
              نمونه‌ای از این نگاه را در ژورنال بخوانید
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
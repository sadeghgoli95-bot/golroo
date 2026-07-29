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
import { SITE_URL } from "@/lib/seo/site";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "درباره | گل‌رو",
    description:
      "محمد صادق گل‌رو، روان‌شناس و روان‌درمانگر کودک و نوجوان؛ رویکردی رابطه‌محور، روان‌پویشی و مبتنی بر مشاهده.",
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
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            <h2>نگاه من به روان‌درمانی</h2>

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

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            <h2>رویکرد درمانی</h2>

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

        <section className="section" style={{ background: "var(--bg-soft)" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <h2>درباره من</h2>

            <div style={{ display: "grid", gap: 28, marginTop: 32, lineHeight: 2.2, fontSize: "1.1rem" }}>
              <p>
                <strong>محمد صادق گل‌رو</strong> فارغ‌التحصیل کارشناسی ارشد
                روان‌شناسی تربیتی از دانشگاه تهران مرکز است. مسیر یادگیری کار
                بالینی را با سوپرویژن دکتر زرندی آغاز کرده است؛ تجربه‌ای که در
                شکل‌گیری نگاه او به کار با کودک و نوجوان نقش مهمی داشته است.
              </p>

              <p>
                او هم‌اکنون به‌عنوان <strong>ارزیاب و روان‌شناس تخصصی کودک و
                نوجوان در کلینیک روان‌پویشی آگاه</strong> فعالیت می‌کند. تمرکز
                اصلی کار بالینی او روان‌درمانی کودک و نوجوان و رابطه والد–کودک
                است.
              </p>

              <p>
                بخش مهمی از مطالعه و فعالیت حرفه‌ای او به رشد هیجانی، دلبستگی و
                تحول روانی اختصاص دارد؛ حوزه‌هایی که این باور را تقویت می‌کنند
                که تجربه کودک را نمی‌توان جدا از رابطه‌هایی که در آن‌ها شکل
                می‌گیرد فهمید. به همین دلیل، بازسازی رابطه والد و کودک، در
                بسیاری از موارد، بخشی جدایی‌ناپذیر از فرایند درمان است.
              </p>
            </div>
          </div>
        </section>

        <Manifesto />
        <ReadingPause text="شخصیت کودک، فقط با آنچه برایش اتفاق می‌افتد شکل نمی‌گیرد؛ با تجربهٔ فهمیده شدن و فهمیده نشدن نیز شکل می‌گیرد." />

        <section className="section" style={{ background: "var(--bg-soft)" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <h2>در این سایت چه خواهید خواند؟</h2>

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

        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ marginBottom: 8 }}>ارزش‌هایی که به آن‌ها پایبندم</h2>

            <ul
              style={{
                listStyle: "none",
                display: "grid",
                gap: 0,
                marginTop: 32,
              }}
            >
              {[
                "کنجکاوی به جای قضاوت",
                "فهم به جای نصیحت",
                "مسئولیت به جای سرزنش",
                "پیچیدگی به جای ساده‌سازی",
                "رابطه به جای فردگرایی افراطی",
                "فروتنی معرفتی به جای قطعیت",
              ].map((value, index) => (
                <li
                  key={value}
                  style={{
                    padding: "1.4rem 0",
                    borderTop: index === 0 ? "none" : "1px solid var(--line)",
                    fontSize: "1.15rem",
                    color: "var(--text)",
                  }}
                >
                  {value}
                </li>
              ))}
            </ul>

            <blockquote className="pull-quote" style={{ marginTop: "3.5rem" }}>
              ذهن انسان مسئله‌ای نیست که حل شود؛
              <br />
              تجربه‌ای است که باید با دقت، کنجکاوی و احترام به آن نزدیک شد.
            </blockquote>
          </div>
        </section>

        <Services />

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
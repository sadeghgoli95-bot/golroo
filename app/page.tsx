import { Vazirmatn } from "next/font/google";
import type { Metadata } from "next";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: "گل‌رو | روان‌درمانگری کودک و نوجوان",
  description: "صادق گل‌رو، روان‌درمانگر کودک و نوجوان در حوزه سنی صفر تا دوازده سال. فضایی که کودک در آن، خودش را می‌بیند.",
  keywords: ["روان‌درمانگری کودک", "روانشناس کودک", "درمانگر کودک", "مشاوره کودک", "گل‌رو"],
  openGraph: {
    title: "گل‌رو | روان‌درمانگری کودک و نوجوان",
    description: "فضایی که کودک در آن، خودش را می‌بیند.",
    locale: "fa_IR",
    type: "website",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "گل‌رو",
    description: "روان‌درمانگری کودک و نوجوان در حوزه سنی صفر تا دوازده سال",
    url: "https://golroo.ir",
    email: "info@golroo.ir",
    medicalSpecialty: "روان‌درمانگری کودک",
    inLanguage: "fa",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 1s ease forwards; }
        .fu1 { animation: fadeUp 1s ease 0.15s forwards; opacity: 0; }
        .fu2 { animation: fadeUp 1s ease 0.3s forwards; opacity: 0; }
        .fu3 { animation: fadeUp 1s ease 0.45s forwards; opacity: 0; }
        html { scroll-behavior: smooth; }
        a { transition: opacity 0.25s ease; }
        a:hover { opacity: 0.55; }
        .service-card { transition: border-color 0.25s ease; }
        .service-card:hover { border-color: #1C1C1C !important; }
        @media (max-width: 768px) {
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
          .hero-title { font-size: 2rem !important; }
          section, nav, footer { padding-right: 1.5rem !important; padding-left: 1.5rem !important; }
        }
      `}</style>

      <main
        dir="rtl"
        className={vazir.className}
        style={{
          backgroundColor: "#FAF9F6",
          color: "#1C1C1C",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* ناوبری */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            left: 0,
            padding: "1.4rem 3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(250,249,246,0.93)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #E5E0D8",
            zIndex: 100,
          }}
        >
          <span style={{ fontSize: "1.15rem", fontWeight: 500 }}>گل‌رو</span>
          <div
            className="nav-links"
            style={{ display: "flex", gap: "2.5rem", fontSize: "0.87rem", color: "#6B6B6B" }}
          >
            <a href="#about" style={{ textDecoration: "none", color: "inherit" }}>درباره</a>
            <a href="#services" style={{ textDecoration: "none", color: "inherit" }}>خدمات</a>
            <a href="#philosophy" style={{ textDecoration: "none", color: "inherit" }}>رویکرد</a>
            <a href="#contact" style={{ textDecoration: "none", color: "inherit" }}>تماس</a>
          </div>
          <a
            href="#contact"
            style={{
              fontSize: "0.82rem",
              padding: "0.6rem 1.4rem",
              backgroundColor: "#1C1C1C",
              color: "#FAF9F6",
              textDecoration: "none",
              fontWeight: 400,
            }}
          >
            درخواست مشاوره
          </a>
        </nav>

        {/* هیرو */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "9rem 3rem 6rem",
            maxWidth: "920px",
          }}
        >
          <p
            className="fu"
            style={{ fontSize: "0.78rem", color: "#999", letterSpacing: "0.14em", marginBottom: "2rem", textTransform: "uppercase" }}
          >
            روان‌درمانگری کودک — صفر تا دوازده سال
          </p>
          <h1
            className="fu1 hero-title"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", fontWeight: 300, lineHeight: 1.75, marginBottom: "2.5rem" }}
          >
            فضایی که کودک
            <br />
            در آن، خودش را می‌بیند.
          </h1>
          <p
            className="fu2"
            style={{ fontSize: "1.05rem", lineHeight: 2.3, color: "#6B6B6B", maxWidth: "500px", marginBottom: "3.5rem", fontWeight: 300 }}
          >
            کودکان با زبان بازی حرف می‌زنند، با سکوت سوال می‌کنند،
            و با رفتار نشان می‌دهند که چه چیزی کم دارند.
            درمانگری که می‌بیند، می‌تواند پاسخ بدهد.
          </p>
          <div className="fu3" style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
            <a
              href="#contact"
              style={{
                display: "inline-block",
                padding: "1rem 2.6rem",
                backgroundColor: "#1C1C1C",
                color: "#FAF9F6",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              درخواست مشاوره
            </a>
            <a
              href="#about"
              style={{ fontSize: "0.88rem", color: "#6B6B6B", textDecoration: "none", borderBottom: "1px solid #CCC", paddingBottom: "2px" }}
            >
              بیشتر بدانید
            </a>
          </div>
        </section>

        {/* نقل قول */}
        <section
          style={{
            padding: "5rem 3rem",
            backgroundColor: "#F0EDE7",
            borderTop: "1px solid #E5E0D8",
            borderBottom: "1px solid #E5E0D8",
          }}
        >
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              fontWeight: 300,
              lineHeight: 2.2,
              color: "#444",
              maxWidth: "680px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            «کودک شما، از همان روزهای اول، یک چیز یاد گرفت:
            چطور نگاه کند. نه به دنیا — به شما.»
          </p>
        </section>

        {/* درباره */}
        <section
          id="about"
          style={{
            padding: "7rem 3rem",
            borderBottom: "1px solid #E5E0D8",
          }}
        >
          <div
            className="grid-2"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", maxWidth: "1100px" }}
          >
            <div>
              <p style={{ fontSize: "0.78rem", color: "#999", letterSpacing: "0.14em", marginBottom: "1.8rem" }}>
                درباره
              </p>
              <h2 style={{ fontSize: "2rem", fontWeight: 300, lineHeight: 1.8, marginBottom: "2rem" }}>
                صادق گل‌رو
              </h2>
              <p style={{ fontSize: "0.98rem", lineHeight: 2.5, color: "#555", fontWeight: 300, marginBottom: "1.5rem" }}>
                روان‌درمانگر کودک و نوجوان با تخصص در حوزه سنی صفر تا دوازده سال.
                رویکرد من بر پایه نظریه‌های رابطه‌ای و روانکاوی کودک بنا شده است.
              </p>
              <p style={{ fontSize: "0.98rem", lineHeight: 2.5, color: "#555", fontWeight: 300 }}>
                اعتقاد دارم که کودک برای رشد، به دیده شدن نیاز دارد —
                نه به اصلاح شدن. درمان از جایی شروع می‌شود که کودک
                احساس کند حضورش اهمیت دارد.
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#E8E4DE",
                minHeight: "360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#BBB", fontSize: "0.82rem", letterSpacing: "0.08em" }}>تصویر</p>
            </div>
          </div>
        </section>

        {/* خدمات */}
        <section
          id="services"
          style={{ padding: "7rem 3rem", borderBottom: "1px solid #E5E0D8" }}
        >
          <p style={{ fontSize: "0.78rem", color: "#999", letterSpacing: "0.14em", marginBottom: "1.8rem" }}>
            خدمات
          </p>
          <h2 style={{ fontSize: "2rem", fontWeight: 300, lineHeight: 1.8, marginBottom: "4rem" }}>
            چطور کمک می‌کنم
          </h2>
          <div
            className="grid-3"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}
          >
            {[
              {
                num: "۰۱",
                title: "ارزیابی کودک",
                desc: "بررسی جامع وضعیت رشدی، هیجانی، و رابطه‌ای کودک از طریق مصاحبه با والدین و جلسات مستقیم با کودک.",
              },
              {
                num: "۰۲",
                title: "روان‌درمانی فردی",
                desc: "جلسات درمانی منظم بر پایه بازی، روایت، و رابطه درمانی. متناسب با سن و نیاز هر کودک.",
              },
              {
                num: "۰۳",
                title: "مشاوره والدین",
                desc: "همراهی والدین در فهمیدن کودک، پاسخ به نگرانی‌ها، و تقویت رابطه‌ای که کودک در آن رشد کند.",
              },
            ].map((s) => (
              <div
                key={s.num}
                className="service-card"
                style={{
                  padding: "2.8rem 2.5rem",
                  border: "1px solid #E5E0D8",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                <span style={{ fontSize: "0.78rem", color: "#BBB", letterSpacing: "0.1em" }}>{s.num}</span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 500 }}>{s.title}</h3>
                <p style={{ fontSize: "0.92rem", lineHeight: 2.2, color: "#666", fontWeight: 300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* رویکرد */}
        <section
          id="philosophy"
          style={{ padding: "7rem 3rem", borderBottom: "1px solid #E5E0D8", maxWidth: "760px" }}
        >
          <p style={{ fontSize: "0.78rem", color: "#999", letterSpacing: "0.14em", marginBottom: "1.8rem" }}>
            رویکرد
          </p>
          <h2 style={{ fontSize: "2rem", fontWeight: 300, lineHeight: 1.8, marginBottom: "3.5rem" }}>
            چرا گل‌رو؟
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 2.7, color: "#444", fontWeight: 300, marginBottom: "2rem" }}>
            کودک شما، از همان روزهای اول، یک چیز یاد گرفت: چطور نگاه کند.
            نه به دنیا — به شما.
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 2.7, color: "#444", fontWeight: 300, marginBottom: "2rem" }}>
            در صورت شما دنبال یک چیز می‌گشت — خودش.
            وقتی نگرانی دید، نگران ماند.
            وقتی خستگی دید، خاموش شد.
            وقتی در آن نگاه خودش را پیدا کرد، رشد کرد.
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 2.7, color: "#444", fontWeight: 300 }}>
            «رو» در فارسی یعنی چهره.
            گل‌رو می‌خواهد چهره‌ای باشد که کودک در آن، خودش را ببیند.
          </p>
        </section>

        {/* تماس */}
        <section
          id="contact"
          style={{ padding: "7rem 3rem", borderBottom: "1px solid #E5E0D8" }}
        >
          <p style={{ fontSize: "0.78rem", color: "#999", letterSpacing: "0.14em", marginBottom: "1.8rem" }}>
            تماس
          </p>
          <h2 style={{ fontSize: "2rem", fontWeight: 300, lineHeight: 1.8, marginBottom: "1.5rem" }}>
            شروع از یک گفت‌وگو
          </h2>
          <p style={{ fontSize: "0.98rem", lineHeight: 2.3, color: "#666", fontWeight: 300, maxWidth: "460px", marginBottom: "3.5rem" }}>
            اگر نگران کودکتان هستید یا سوالی دارید،
            اولین قدم یک مکالمه کوتاه است.
            جلسه اول ارزیابی است، نه تعهد.
          </p>
          <a
            href="mailto:info@golroo.ir"
            style={{
              display: "inline-block",
              fontSize: "0.95rem",
              color: "#1C1C1C",
              textDecoration: "none",
              borderBottom: "1px solid #1C1C1C",
              paddingBottom: "3px",
              fontWeight: 400,
            }}
          >
            info@golroo.ir
          </a>
        </section>

        {/* فوتر */}
        <footer
          style={{
            padding: "2.5rem 3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.78rem",
            color: "#BBB",
          }}
        >
          <span>گل‌رو — ۱۴۰۴</span>
          <span>روان‌درمانگری کودک و نوجوان</span>
        </footer>

      </main>
    </>
  );
}

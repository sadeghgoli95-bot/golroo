import { Vazirmatn } from "next/font/google";
import type { Metadata } from "next";

const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: "گل‌رو | روان‌درمانگری کودک و نوجوان",
  description: "صادق گل‌رو، روان‌درمانگر کودک و نوجوان در حوزه سنی صفر تا دوازده سال. فضایی که کودک در آن، خودش را می‌بیند.",
  keywords: ["روان‌درمانگری کودک", "روانشناس کودک", "درمانگر کودک", "روانشناس نوجوان", "مشاوره کودک", "گل‌رو"],
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
    "name": "گل‌رو",
    "description": "روان‌درمانگری کودک و نوجوان در حوزه سنی صفر تا دوازده سال",
    "url": "https://golroo.ir",
    "email": "info@golroo.ir",
    "medicalSpecialty": "روان‌درمانگری کودک",
    "inLanguage": "fa",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        dir="rtl"
        className={vazir.className}
        style={{
          backgroundColor: "#FAF9F6",
          color: "#1a1a1a",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            padding: "2.5rem 3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e8e4de",
          }}
        >
          <span style={{ fontSize: "1.3rem", fontWeight: 500 }}>
            گل‌رو
          </span>
          <nav style={{ display: "flex", gap: "2rem", fontSize: "0.9rem", color: "#666" }}>
            <a href="#about" style={{ textDecoration: "none", color: "inherit" }}>درباره</a>
            <a href="#contact" style={{ textDecoration: "none", color: "inherit" }}>تماس</a>
          </nav>
        </header>

        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "6rem 3rem",
            maxWidth: "720px",
          }}
        >
          <h1
            style={{
              fontSize: "2.8rem",
              fontWeight: 300,
              lineHeight: 1.8,
              marginBottom: "2rem",
            }}
          >
            فضایی که کودک
            <br />
            در آن، خودش را می‌بیند.
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 2,
              color: "#555",
              maxWidth: "540px",
              marginBottom: "3rem",
              fontWeight: 300,
            }}
          >
            روان‌درمانگری کودک و نوجوان در حوزه سنی صفر تا دوازده سال.
          </p>
          <a
            href="#contact"
            style={{
              display: "inline-block",
              padding: "0.9rem 2.5rem",
              backgroundColor: "#1a1a1a",
              color: "#FAF9F6",
              textDecoration: "none",
              fontSize: "0.95rem",
              width: "fit-content",
              fontWeight: 400,
            }}
          >
            درخواست مشاوره
          </a>
        </section>

        <section
          id="about"
          style={{
            padding: "5rem 3rem",
            borderTop: "1px solid #e8e4de",
            maxWidth: "680px",
          }}
        >
          <p style={{ fontSize: "1.05rem", lineHeight: 2.4, color: "#444", fontWeight: 300 }}>
            کودک شما، از همان روزهای اول، یک چیز یاد گرفت: چطور نگاه کند.
            نه به دنیا — به شما.
            <br /><br />
            در صورت شما دنبال یک چیز می‌گشت — خودش.
            <br /><br />
            گل‌رو می‌خواهد چهره‌ای باشد که کودک در آن، خودش را ببیند.
          </p>
        </section>

        <section
          id="contact"
          style={{
            padding: "4rem 3rem",
            borderTop: "1px solid #e8e4de",
          }}
        >
          <p style={{ fontSize: "0.95rem", color: "#666", marginBottom: "1rem", fontWeight: 300 }}>
            برای رزرو جلسه اول:
          </p>
          <a
            href="mailto:info@golroo.ir"
            style={{
              fontSize: "1rem",
              color: "#1a1a1a",
              textDecoration: "none",
              borderBottom: "1px solid #1a1a1a",
              paddingBottom: "2px",
            }}
          >
            info@golroo.ir
          </a>
        </section>

        <footer
          style={{
            padding: "2rem 3rem",
            borderTop: "1px solid #e8e4de",
            fontSize: "0.8rem",
            color: "#aaa",
            fontWeight: 300,
          }}
        >
          گل‌رو — ۱۴۰۴
        </footer>
      </main>
    </>
  );
}

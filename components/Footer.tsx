import Link from "next/link";
import Container from "./Container";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--surface)",
        color: "var(--text-muted)",
        borderTop: "1px solid var(--line)",
        padding: "5rem 0 3rem",
      }}
    >
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "4rem",
            marginBottom: "5rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: 300, marginBottom: "1.5rem", color: "var(--primary)" }}>
              گل‌رو
            </h2>
            <p style={{ maxWidth: 420, lineHeight: 1.9, color: "var(--text-muted)" }}>
              فضایی برای فهم عمیق‌تر تجربه کودک،
              نوجوان و خانواده؛
              با رویکردی رابطه‌محور،
              روان‌پویشی و مبتنی بر مشاهده.
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: "1.5rem", fontWeight: 500, fontSize: "1rem", color: "var(--primary)" }}>دسترسی سریع</h3>
            <nav aria-label="لینک‌های تندسترسی فوتر" style={{ display: "grid", gap: ".9rem", color: "var(--text-soft)" }}>
              <Link href="/">خانه</Link>
              <Link href="/journal">ژورنال</Link>
              <Link href="/about">درباره</Link>
              <Link href="/faq">پرسش‌های متداول</Link>
              <Link href="/contact">ارتباط</Link>
              <Link href="/privacy">حریم خصوصی</Link>
              <Link href="/terms">قوانین و مقررات</Link>
            </nav>
          </div>

          <div>
            <h3 style={{ marginBottom: "1.5rem", fontWeight: 500, fontSize: "1rem", color: "var(--primary)" }}>ارتباط</h3>
            <div style={{ display: "grid", gap: ".9rem", color: "var(--text-soft)" }}>
              <a href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer">
                واتساپ
              </a>
              <a href={siteConfig.contact.instagram} target="_blank" rel="noopener noreferrer">
                اینستاگرام
              </a>
              <a href={siteConfig.contact.telegram} target="_blank" rel="noopener noreferrer">
                تلگرام
              </a>
              <a href={`mailto:${siteConfig.contact.email}`}>ایمیل</a>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--line)",
            paddingTop: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
            color: "var(--text-light)",
            fontSize: ".95rem",
          }}
        >
          <span>© 2026 Golroo. All rights reserved.</span>
          <span>Designed with patience.</span>
        </div>
      </Container>
    </footer>
  );
}

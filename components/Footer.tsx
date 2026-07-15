import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--primary)",
        color: "var(--bg)",
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
            <h2 style={{ fontSize: "2.8rem", fontWeight: 300, marginBottom: "1.5rem", color: "var(--bg)" }}>
              گل‌رو
            </h2>
            <p style={{ maxWidth: 420, lineHeight: 1.9, color: "color-mix(in srgb, var(--bg) 72%, transparent)" }}>
              فضایی برای فهم عمیق‌تر تجربه کودک،
              نوجوان و خانواده؛
              با رویکردی رابطه‌محور،
              روان‌پویشی و مبتنی بر مشاهده.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: "1.5rem", fontWeight: 500, color: "var(--bg)" }}>دسترسی سریع</h4>
            <nav style={{ display: "grid", gap: ".9rem" }}>
              <Link href="/">خانه</Link>
              <Link href="/journal">ژورنال</Link>
              <a href="/about">درباره</a>
              <a href="/services">خدمات</a>
              <a href="/contact">ارتباط</a>
            </nav>
          </div>

          <div>
            <h4 style={{ marginBottom: "1.5rem", fontWeight: 500, color: "var(--bg)" }}>ارتباط</h4>
            <div style={{ display: "grid", gap: ".9rem", color: "color-mix(in srgb, var(--bg) 72%, transparent)" }}>
              <span>Online Sessions</span>
              <span>Instagram</span>
              <span>Telegram</span>
              <span>Email</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid color-mix(in srgb, var(--bg) 18%, transparent)",
            paddingTop: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
            color: "color-mix(in srgb, var(--bg) 72%, transparent)",
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

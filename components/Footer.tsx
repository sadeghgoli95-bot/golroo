import Container from "./Container";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "5rem 0 3rem" }}>
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
            <h2 style={{ fontSize: "2.8rem", fontWeight: 300, marginBottom: "1.5rem" }}>
              گل‌رو
            </h2>
            <p style={{ maxWidth: 420, lineHeight: 2.1, color: "var(--text-muted)" }}>
              فضایی برای فهم عمیق‌تر تجربه کودک،
              نوجوان و خانواده؛
              با رویکردی رابطه‌محور،
              روان‌پویشی و مبتنی بر مشاهده.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: "1.5rem", fontWeight: 500 }}>دسترسی سریع</h4>
            <nav style={{ display: "grid", gap: ".9rem" }}>
              <a href="/">خانه</a>
              <a href="/journal">ژورنال</a>
              <a href="/about">درباره</a>
              <a href="/services">خدمات</a>
              <a href="/contact">ارتباط</a>
            </nav>
          </div>

          <div>
            <h4 style={{ marginBottom: "1.5rem", fontWeight: 500 }}>ارتباط</h4>
            <div style={{ display: "grid", gap: ".9rem", color: "var(--text-muted)" }}>
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
            borderTop: "1px solid var(--border)",
            paddingTop: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
            color: "var(--text-muted)",
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

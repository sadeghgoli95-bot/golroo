import Link from "next/link";
import Container from "./Container";

export default function ApproachPreview() {
  return (
    <section className="section">
      <Container>
        <div style={{ maxWidth: 680 }}>
          <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
            WHY THIS APPROACH
          </p>
          <h2 style={{ fontSize: "clamp(2.2rem,4vw,3.2rem)", fontWeight: 300, lineHeight: 1.65, marginBottom: "1.6rem" }}>
            گاهی آنچه والد را نگران می‌کند، همان چیزی نیست که کودک از آن رنج می‌برد.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 2.1, color: "var(--text-muted)", marginBottom: "2rem" }}>
            پیش از آنکه به دنبال تغییر رفتار باشیم، تلاش می‌کنیم بفهمیم کودک چه تجربه‌ای را زندگی
            می‌کند و این تجربه در چه رابطه‌هایی شکل گرفته است.
          </p>
          <Link href="/about" className="btn-text">
            درباره نگاه بالینی من بخوانید
          </Link>
        </div>
      </Container>
    </section>
  );
}

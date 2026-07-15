import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main dir="rtl">

        <section className="editorial-space">
          <div className="container">
            <p className="overline">CONTACT</p>
            <h1 className="display">درخواست جلسه</h1>
            <p className="lead">
              برای هماهنگی جلسات آنلاین یا حضوری می‌توانید از راه‌های زیر با من در ارتباط باشید.
            </p>
          </div>
        </section>

        <section style={{ padding: "90px 0" }}>
          <div className="container" style={{ maxWidth: 820, display: "grid", gap: 64 }}>

            {/* جلسات آنلاین */}
            <div style={{ display: "grid", gap: 24 }}>
              <h2 style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
                جلسات آنلاین
              </h2>
              <p style={{ color: "var(--text-soft)", lineHeight: 2 }}>
                برای هماهنگی جلسات آنلاین، سریع‌ترین راه ارتباطی واتساپ یا تلگرام است.
              </p>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <a
                  href="https://wa.me/989120538112"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.9rem 2rem",
                    border: "1px solid var(--primary)",
                    borderRadius: "var(--radius-btn)",
                    color: "var(--primary)",
                    textDecoration: "none",
                    transition: ".3s",
                  }}
                >
                  واتساپ
                </a>
                <a
                  href="https://t.me/SadeghGolroo"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.9rem 2rem",
                    border: "1px solid var(--primary)",
                    borderRadius: "var(--radius-btn)",
                    color: "var(--primary)",
                    textDecoration: "none",
                    transition: ".3s",
                  }}
                >
                  تلگرام
                </a>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--line)" }} />

            {/* جلسات حضوری */}
            <div style={{ display: "grid", gap: 24 }}>
              <h2 style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
                جلسات حضوری
              </h2>
              <p style={{ color: "var(--text-soft)", lineHeight: 2 }}>
                تهران، پاسداران، خیابان بوستان دوم، خیابان گیلان غربی، بین فرخی یزدی و داوود اسلامی، نبش موحد ۲، پلاک ۵
              </p>

              <div style={{ display: "grid", gap: 12 }}>
                <a
                  href="tel:+982122849351"
                  style={{ color: "var(--text-soft)", textDecoration: "none" }}
                >
                  تماس با کلینیک: ۰۲۱-۲۲۸۴۹۳۵۱
                </a>
                <a
                  href="tel:+989307070617"
                  style={{ color: "var(--text-soft)", textDecoration: "none" }}
                >
                  تماس همراه: ۰۹۳۰-۷۰۷۰۶۱۷
                </a>
              </div>

              <a
                href="https://maps.app.goo.gl/j8VEYrMmMFQFLCLWA"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--bronze)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  width: "fit-content",
                  borderBottom: "1px solid var(--bronze)",
                  paddingBottom: "2px",
                }}
              >
                مشاهده روی نقشه ←
              </a>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

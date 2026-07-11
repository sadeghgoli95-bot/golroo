import Container from "./Container";
import SectionTitle from "./SectionTitle";

export default function Philosophy() {
  return (
    <section
      id="philosophy"
      className="section"
      style={{
        background: "var(--bg-soft)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Container>
        <div style={{ maxWidth: 860 }}>
          <SectionTitle
            overline="PHILOSOPHY"
            title={
              <>
                پیش از آنکه
                <br />
                چیزی را تغییر دهیم،
                <br />
                سعی می‌کنیم آن را بفهمیم.
              </>
            }
          />
          <div style={{ display: "grid", gap: 36, fontSize: 20 }}>
            <p>
              رفتار کودک همیشه مشکل نیست.
              گاهی تنها زبانی است که برای بیان تجربه‌اش در اختیار دارد.
            </p>
            <p>
              هدف درمان برای ما حذف سریع نشانه‌ها نیست.
              تلاش می‌کنیم بفهمیم این رفتار چگونه شکل گرفته،
              چه معنایی دارد و در چه رابطه‌ای ادامه پیدا کرده است.
            </p>
            <p>
              وقتی تجربه کودک فهمیده می‌شود،
              تغییر معمولاً از جایی آغاز می‌شود
              که دیگر نیازی به اجبار ندارد.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Container from "./Container";

const ageGroups = [
  {
    age: "۰ تا ۴ سال",
    title: "روان‌درمانی کودک و کار با والدین",
    description:
      "در سال‌های نخست زندگی، بسیاری از دشواری‌های کودک در بستر رابطه با مراقبان اصلی معنا پیدا می‌کنند. در این دوره، توجه به رابطه کودک و والد، تنظیم هیجانی، رفتارهای دشوار، خواب، جدایی و دیگر نگرانی‌های دوران اولیه رشد می‌تواند بخشی از فرایند درمان باشد.",
  },
  {
    age: "۴ تا ۸ سال",
    title: "روان‌درمانی کودک و مشاوره والدین",
    description:
      "در این سنین، کودک بخش مهمی از تجربه درونی خود را از طریق بازی، رفتار و رابطه بیان می‌کند. درمان می‌تواند به فهم دشواری‌های هیجانی و رفتاری کودک و همچنین رابطه او با والدین و محیط زندگی کمک کند.",
  },
  {
    age: "۸ تا ۱۴ سال",
    title: "روان‌درمانی کودک و نوجوان و مشاوره والدین",
    description:
      "با ورود کودک به سال‌های مدرسه و نوجوانی، روابط، استقلال، تصویر از خود و تجربه هیجانی پیچیده‌تر می‌شوند. درمان فضایی برای فهم تجربه درونی کودک یا نوجوان و بررسی رابطه او با خانواده، همسالان و محیط فراهم می‌کند.",
  },
];

const outOfScopeItems = [
  "اختلالات یادگیری که به ارزیابی و مداخله تخصصی نیاز دارند",
  "تأخیرهای رشدی در کودکان بالاتر از ۴ سال",
  "مشکلات ناشی از آسیب‌های مغزی",
  "اوتیسم در کودکان بالاتر از ۴ سال",
  "اختلالات و مشکلات گفتار و زبان",
];

export default function Services() {
  return (
    <section className="section" style={{ background: "var(--bg-soft)" }}>
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: "5rem",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div>
            <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
              SERVICES
            </p>
            <h2
              style={{
                fontSize: "clamp(2.8rem,5vw,4.2rem)",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            >
              خدمات
            </h2>
          </div>
          <p
            style={{
              maxWidth: 480,
              lineHeight: 2,
              color: "var(--text-muted)",
            }}
          >
            جلسات روان‌درمانی و مشاوره برای کودکان و نوجوانان ۰ تا ۱۴ سال، به‌صورت حضوری در کلینیک آگاه تهران و آنلاین برگزار می‌شود. در این فرایند، در کنار توجه به تجربه کودک، رابطه او با والدین و محیط زندگی نیز مورد توجه قرار می‌گیرد.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))",
            gap: "2rem",
          }}
        >
          {ageGroups.map((group) => (
            <article key={group.age} className="card card-static">
              <div style={{ color: "var(--bronze)", fontSize: 14, marginBottom: 24 }}>
                {group.age}
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 300, marginBottom: 20, lineHeight: 1.8 }}>
                {group.title}
              </h3>
              <p style={{ lineHeight: 2.1, color: "var(--text-muted)" }}>
                {group.description}
              </p>
            </article>
          ))}
        </div>

        {/* Parent consultation — same visual system as the age-group cards
            above, deliberately not louder: same border/padding treatment,
            single wide panel instead of a 3-up grid. */}
        <article className="card card-static" style={{ marginTop: "2rem" }}>
          <div style={{ color: "var(--bronze)", fontSize: 14, marginBottom: 24 }}>
            مشاوره والدین
          </div>
          <h3 style={{ fontSize: 26, fontWeight: 300, marginBottom: 20, lineHeight: 1.8, maxWidth: "36ch" }}>
            فهم رفتار کودک، پیش از تلاش برای تغییر آن
          </h3>
          <p style={{ lineHeight: 2.1, color: "var(--text-muted)", maxWidth: "68ch" }}>
            گاهی آنچه در رفتار کودک دیده می‌شود، تنها بخشی از ماجراست. جلسات والدین فرصتی است برای فهم دقیق‌تر رفتار کودک، رابطه والد–کودک و موقعیت‌هایی که ممکن است به تداوم یک دشواری کمک کنند.
          </p>
        </article>

        {/* Out-of-scope / referral — deliberately not styled as a warning
            or disclaimer: no icons, no red, same rule-and-whitespace
            language as the rest of the page. Eyebrow uses the muted-gold
            accent (the one sanctioned use of it here), body stays on the
            normal readable text tone. */}
        <div style={{ marginTop: "5rem", paddingTop: "3rem", borderTop: "1px solid var(--line)" }}>
          <div style={{ color: "var(--honey)", letterSpacing: ".18em", fontSize: 13, marginBottom: 20 }}>
            چه مسائلی در حیطه کار من نیست؟
          </div>
          <p style={{ lineHeight: 2.1, color: "var(--text-muted)", maxWidth: "68ch", marginBottom: "1.8rem" }}>
            بعضی دشواری‌ها بیش از آنکه به روان‌درمانی نیاز داشته باشند، به ارزیابی تخصصی یا مداخله‌ای متفاوت احتیاج دارند. در چنین مواردی، اولویت من انتخاب مناسب‌ترین مسیر برای کودک است، نه شروع درمان به هر قیمت.
          </p>
          <p style={{ color: "var(--text)", marginBottom: "1.2rem" }}>
            در حال حاضر، این موارد در حیطه خدمات من قرار نمی‌گیرند:
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "grid",
              gap: "1rem",
              marginBottom: "1.8rem",
              maxWidth: "68ch",
            }}
          >
            {outOfScopeItems.map((item) => (
              <li
                key={item}
                style={{
                  paddingRight: "1.5rem",
                  borderRight: "1px solid var(--line)",
                  color: "var(--text-muted)",
                  lineHeight: 1.9,
                }}
              >
                {item}
              </li>
            ))}
          </ul>
          <p style={{ lineHeight: 2.1, color: "var(--text-muted)", maxWidth: "68ch" }}>
            در صورت نیاز، ممکن است پیش از شروع درمان، ارزیابی تکمیلی یا ارجاع به متخصص مربوط پیشنهاد شود.
          </p>
        </div>
      </Container>
    </section>
  );
}

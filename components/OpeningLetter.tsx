import Container from "./Container";

function Highlight({ children }: { children: string }) {
  return <span style={{ color: "var(--accent)" }}>{children}</span>;
}

export default function OpeningLetter() {
  return (
    <section className="section">
      <Container>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            fontSize: 19,
            lineHeight: 2.1,
            color: "var(--text-soft)",
          }}
        >
          <p style={{ marginBottom: 28 }}>
            شاید مدت‌هاست <Highlight>چیزی ذهنتان را رها نمی‌کند</Highlight>.
            <br />
            نه یک اتفاق مشخص؛ یک احساس.
            <br />
            اینکه فرزندتان شبیه گذشته نیست و شما دقیقاً نمی‌دانید چرا.
          </p>

          <p style={{ marginBottom: 28 }}>
            گاهی با خودتان می‌گویید:
            <br />
            «شاید زیادی نگرانم.»
            <br />
            چند ساعت بعد، با دیدن همان رفتار، دوباره فکر می‌کنید:
            <br />
            «<Highlight>نکند واقعاً چیزی درست نباشد</Highlight>.»
          </p>

          <p style={{ marginBottom: 28 }}>
            شاید کتاب خوانده باشید.
            <br />
            شاید از اطرافیان کمک خواسته باشید.
            <br />
            شاید ساعت‌ها در اینترنت به دنبال پاسخی گشته باشید.
          </p>

          <p style={{ marginBottom: 28 }}>
            شاید حتی بعضی شب‌ها، وقتی فرزندتان خوابیده، بی‌صدا از خودتان
            پرسیده باشید:
            <br />
            «<Highlight>نکند من جایی او را نفهمیده باشم؟</Highlight>»
          </p>

          <p style={{ marginBottom: 28 }}>
            کمتر مادری این سؤال را با صدای بلند می‌پرسد.
            <br />
            اما بسیاری از مادرها، بارها آن را در سکوت از خودشان پرسیده‌اند.
          </p>

          <p style={{ marginBottom: 28 }}>
            گاهی اولین پرسشی که به ذهن می‌رسد این است:
            <br />
            «چطور این رفتار را متوقف کنم؟»
            <br />
            اما شاید پرسش مهم‌تری وجود داشته باشد:
            <br />
            «<Highlight>این رفتار، دارد از چه چیزی محافظت می‌کند؟</Highlight>»
          </p>

          <p style={{ marginBottom: 28 }}>
            رفتار امروز کودک، گاهی ادامهٔ تجربه‌هایی است که مدت‌ها پیش آغاز
            شده‌اند.
          </p>

          <p>
            و شاید مهم‌ترین هدیه‌ای که می‌توان به یک کودک داد، این نباشد که
            همیشه پاسخش را بدانیم؛ این است که آن‌قدر <Highlight>کنارش بمانیم</Highlight> تا
            بتوانیم <Highlight>سؤال درست</Highlight> را پیدا کنیم.
          </p>
        </div>
      </Container>
    </section>
  );
}

import Image from "next/image";
import Container from "./Container";
import Button from "./Button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-redesign">
      <div className="hero-visual">
        <Image
          src="/hero/golroo-hero.webp"
          alt="شاخه‌ای با شکوفه‌های بنفش در نوری ملایم، مقابل دیواری روشن و گرم"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 58vw"
          className="hero-visual-img"
        />
      </div>

      <Container>
        <div className="hero-content">
          <div className="hero-eyebrow fade-up">
            <span className="hero-eyebrow-mark" />
            SADEGH GOLROO
          </div>
          <h1 className="hero-heading fade-up fade-delay-1">
            هر کودکی
            <br className="hero-break" />{" "}
            داستانش را
            <br className="hero-break" />{" "}
            با کلمات تعریف نمی‌کند.
          </h1>
          <p className="hero-lead fade-up fade-delay-2">
            گاهی آنچه والدین «رفتار» می‌بینند، تلاش کودک برای گفتن چیزی است که هنوز واژه‌ای برای آن پیدا نکرده است. اینجا، پیش از آنکه به دنبال تغییر رفتار باشیم، تلاش می‌کنیم دنیای درونی او را دقیق‌تر ببینیم و رابطه‌ای را که در آن رشد می‌کند، بهتر بفهمیم.
          </p>
          <div className="hero-actions fade-up fade-delay-3">
            <Button href="/appointment">رزرو جلسه</Button>
            <Link href="/about" className="btn btn-secondary">
              نگاه من به این مسیر
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

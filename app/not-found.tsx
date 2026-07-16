import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="editorial-space" dir="rtl">
      <div className="container reading" style={{ textAlign: "center", margin: "0 auto" }}>
        <p className="overline">۴۰۴</p>
        <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)" }}>
          صفحه مورد نظر پیدا نشد.
        </h1>
        <p className="lead" style={{ margin: "0 auto" }}>
          ممکن است آدرس تغییر کرده باشد، صفحه حذف شده باشد، یا پیوندی که دنبال کرده‌اید دیگر وجود
          نداشته باشد.
        </p>

        <div className="cluster" style={{ justifyContent: "center", gap: "1.2rem", marginTop: "2.5rem" }}>
          <Link href="/" className="button button-primary">
            بازگشت به صفحه اصلی
          </Link>
          <Link href="/journal" className="button button-secondary">
            مشاهده ژورنال
          </Link>
        </div>

        <form
          action="/search"
          method="get"
          role="search"
          style={{ maxWidth: 420, margin: "3rem auto 0" }}
        >
          <input
            type="search"
            name="q"
            placeholder="جستجو در سایت..."
            aria-label="جستجو در سایت"
            className="search-input"
          />
        </form>

        <nav aria-label="لینک‌های مفید" className="cluster" style={{ justifyContent: "center", gap: "2rem", marginTop: "3rem" }}>
          <Link href="/about">درباره من</Link>
          <Link href="/contact">درخواست جلسه</Link>
          <Link href="/journal">ژورنال</Link>
        </nav>
      </div>
    </main>
  );
}

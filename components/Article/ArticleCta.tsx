import Link from "next/link";

export default function ArticleCta() {
  return (
    <div className="article-cta">
      <p>اگر این موضوع برایتان دغدغه است، می‌توانید یک نوبت مشاوره رزرو کنید.</p>
      <Link href="/appointment" className="btn btn-primary">
        رزرو نوبت
      </Link>
    </div>
  );
}

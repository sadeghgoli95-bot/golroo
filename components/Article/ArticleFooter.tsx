import Link from "next/link";

export default function ArticleFooter() {
  return (
    <footer className="article-footer">
      <Link href="/journal" className="btn btn-secondary">
        بازگشت به Journal
      </Link>
    </footer>
  );
}

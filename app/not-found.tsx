import Link from "next/link";

export default function NotFound() {
  return (
    <main className="editorial-space">
      <div className="container reading">
        <p className="overline">404</p>
        <h1 className="display">این صفحه پیدا نشد.</h1>
        <p className="lead">
          ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد.
        </p>
        <Link href="/" className="btn btn-primary">بازگشت به صفحه اصلی</Link>
      </div>
    </main>
  );
}

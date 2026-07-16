import Link from "next/link";

type Props = {
  basePath: string;
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ basePath, currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`);

  return (
    <nav className="pagination" aria-label="صفحه‌بندی">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)}>قبلی</Link>
      ) : (
        <span aria-disabled="true" style={{ opacity: 0.4 }}>
          قبلی
        </span>
      )}

      <span className="pagination-current">
        {currentPage} از {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)}>بعدی</Link>
      ) : (
        <span aria-disabled="true" style={{ opacity: 0.4 }}>
          بعدی
        </span>
      )}
    </nav>
  );
}

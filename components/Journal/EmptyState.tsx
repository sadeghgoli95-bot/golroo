import Link from "next/link";

type Props = {
  text: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export default function EmptyState({ text, buttonLabel = "مشاهده همه مقالات", buttonHref = "/journal" }: Props) {
  return (
    <div className="empty-state">
      <p className="body-lg" style={{ color: "var(--muted)" }}>
        {text}
      </p>
      <Link href={buttonHref} className="button button-primary">
        {buttonLabel}
      </Link>
    </div>
  );
}

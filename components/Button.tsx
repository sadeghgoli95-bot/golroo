import Link from "next/link";

type Props = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "text";
};

export default function Button({ children, href, variant = "primary" }: Props) {
  return (
    <Link href={href} className={`btn btn-${variant}`}>
      {children}
    </Link>
  );
}

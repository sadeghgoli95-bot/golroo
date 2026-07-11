type Props = {
  children: React.ReactNode;
  href: string;
};

export default function Button({ children, href }: Props) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem 2.8rem",
        background: "var(--primary)",
        color: "white",
        textDecoration: "none",
        transition: ".3s",
        borderRadius: 0,
      }}
    >
      {children}
    </a>
  );
}

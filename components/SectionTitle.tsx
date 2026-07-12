type Props = {
  overline?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
};

export default function SectionTitle({ overline, eyebrow, title, description }: Props) {
  const label = eyebrow || overline;
  return (
    <header className="flow-lg">
      {label && (
        <small style={{ color: "var(--accent)" }}>
          {label}
        </small>
      )}
      <h2>{title}</h2>
      {description && (
        <p className="measure">{description}</p>
      )}
    </header>
  );
}

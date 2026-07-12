type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
};

export default function SectionTitle({ eyebrow, title, description }: Props) {
  return (
    <header className="flow-lg">
      {eyebrow && (
        <small style={{ color: "var(--accent)" }}>
          {eyebrow}
        </small>
      )}
      <h2>{title}</h2>
      {description && (
        <p className="measure">{description}</p>
      )}
    </header>
  );
}

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function Question({ title, description, children }: Props) {
  return (
    <section className="rhythm-sm">
      <h2 className="headline">{title}</h2>
      {description && <p className="lead">{description}</p>}
      {children}
    </section>
  );
}

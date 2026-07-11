type SectionProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  narrow?: boolean;
};

export default function Section({
  children,
  id,
  className = "",
  narrow = false,
}: SectionProps) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className={narrow ? "content" : "container"}>
        {children}
      </div>
    </section>
  );
}

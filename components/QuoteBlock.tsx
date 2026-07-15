import Container from "./Container";

type Props = {
  quote: string;
  author?: string;
};

export default function QuoteBlock({ quote, author }: Props) {
  return (
    <section
      className="section"
      style={{
        background: "var(--bg-soft)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <Container>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".25em",
              fontSize: 13,
              marginBottom: 40,
            }}
          >
            A THOUGHT
          </div>

          <blockquote
            style={{
              fontSize: "clamp(2rem,4vw,3rem)",
              lineHeight: 2,
              fontWeight: 300,
            }}
          >
            {quote}
          </blockquote>

          {author && (
            <div
              style={{
                marginTop: 40,
                color: "var(--text-muted)",
                fontSize: 15,
              }}
            >
              — {author}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

import Container from "./Container";

type Props = {
  question: string;
  text: string;
};

export default function QuestionBlock({ question, text }: Props) {
  return (
    <section
      className="section"
      style={{ background: "var(--surface)" }}
    >
      <Container>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".22em",
              fontSize: 13,
              marginBottom: 28,
            }}
          >
            A QUESTION
          </div>
          <h2
            style={{
              fontSize: "clamp(2.4rem,4vw,4rem)",
              lineHeight: 1.8,
              fontWeight: 300,
              marginBottom: 48,
            }}
          >
            {question}
          </h2>
          <p style={{ fontSize: 21, lineHeight: 2.2, maxWidth: 760 }}>
            {text}
          </p>
        </div>
      </Container>
    </section>
  );
}

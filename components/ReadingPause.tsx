import Container from "./Container";

type Props = {
  text: string;
};

export default function ReadingPause({ text }: Props) {
  return (
    <section style={{ padding: "10rem 0" }}>
      <Container>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 1,
              height: 80,
              background: "var(--bronze)",
              margin: "0 auto 60px",
              opacity: .45,
            }}
          />
          <p
            style={{
              fontSize: "clamp(2rem,3vw,3rem)",
              lineHeight: 2,
              fontWeight: 300,
              color: "var(--text)",
            }}
          >
            {text}
          </p>
        </div>
      </Container>
    </section>
  );
}

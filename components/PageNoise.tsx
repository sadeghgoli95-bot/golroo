export default function PageNoise() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        opacity: .035,
        zIndex: -1,
        backgroundImage: `
          radial-gradient(circle at 25% 20%, color-mix(in srgb, var(--text) 8%, transparent) 1px, transparent 1px),
          radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--text) 6%, transparent) 1px, transparent 1px),
          radial-gradient(circle at 40% 90%, color-mix(in srgb, var(--text) 5%, transparent) 1px, transparent 1px)
        `,
        backgroundSize: "180px 180px, 240px 240px, 300px 300px",
      }}
    />
  );
}

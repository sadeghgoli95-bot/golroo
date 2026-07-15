"use client";

import { useEffect, useState } from "react";

export default function AmbientLight() {
  const [y, setY] = useState(0);

  useEffect(() => {
    const scroll = () => {
      setY(window.scrollY * 0.08);
    };
    scroll();
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          top: -220 + y,
          right: -220,
          borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in srgb, var(--accent-dark) 6%, transparent), transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          bottom: -180 - y,
          left: -120,
          borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in srgb, var(--text) 5%, transparent), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}

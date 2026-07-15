"use client";

import { useEffect, useState } from "react";

export default function GridOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "g") {
        setShow(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99999,
        display: "grid",
        gridTemplateColumns: "repeat(12,1fr)",
        gap: "32px",
        padding: "0 48px",
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ background: "color-mix(in srgb, var(--accent-dark) 8%, transparent)" }} />
      ))}
    </div>
  );
}

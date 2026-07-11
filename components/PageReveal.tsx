"use client";

import { useEffect, useState } from "react";

export default function PageReveal() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true);
    }, 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg)",
        transform: ready ? "translateY(-100%)" : "translateY(0)",
        transition: "1.2s cubic-bezier(.22,.61,.36,1)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}

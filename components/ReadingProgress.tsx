"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scroll = () => {
      const h =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(window.scrollY / h);
    };
    scroll();
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        background: "var(--accent)",
        width: `${progress * 100}%`,
        zIndex: 99999,
        transition: "width .08s linear",
      }}
    />
  );
}
